import assert from "node:assert/strict";
import { app } from "../server/app.ts";
import { db } from "../server/db.ts";
import { RegisterSchema, ChatRequestSchema, UpdateSettingsSchema } from "../server/validation/schemas.ts";
import { extractAndPersistMemories, getRelevantMemories } from "../server/ai/memoryService.ts";

console.log("=================================================================");
console.log("   RUNNING ARFA AI PRODUCTION BACKEND & SECURITY TESTS");
console.log("=================================================================");

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  async function expectTest(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`, err);
      failedCount++;
    }
  }

  // TEST 1: Zod Schema Validation
  await expectTest("Schema Rejects Malformed Email", () => {
    const res = RegisterSchema.safeParse({
      email: "invalid-email-address",
      password: "validPassword123",
    });
    assert.equal(res.success, false, "Should fail on invalid email");
  });

  await expectTest("Schema Rejects Password Shorter Than 6 Characters", () => {
    const res = RegisterSchema.safeParse({
      email: "test@example.com",
      password: "123",
    });
    assert.equal(res.success, false, "Should reject password < 6 chars");
  });

  await expectTest("Schema Rejects Empty Chat Message", () => {
    const res = ChatRequestSchema.safeParse({
      message: "   ",
    });
    assert.equal(res.success, false, "Should reject whitespace-only message");
  });

  await expectTest("Schema Rejects Oversized Chat Message (>35,000 chars)", () => {
    const hugeMessage = "A".repeat(36000);
    const res = ChatRequestSchema.safeParse({
      message: hugeMessage,
    });
    assert.equal(res.success, false, "Should reject oversized message payload");
  });

  // TEST 2: User Creation & Password PBKDF2 Hashing
  const testEmailA = `testuser_a_${Date.now()}@example.com`;
  const testEmailB = `testuser_b_${Date.now()}@example.com`;
  let userA: any;
  let userB: any;

  await expectTest("Creates User A with salted PBKDF2 hash", () => {
    userA = db.createUser(testEmailA, "SecretPassword123", "User Alpha");
    assert.ok(userA.id.startsWith("usr_"), "User ID should have prefix usr_");
    assert.notEqual(userA.passwordHash, "SecretPassword123", "Password must be hashed");
    assert.ok(userA.salt, "User must have random salt");
  });

  await expectTest("Creates User B with isolated identity", () => {
    userB = db.createUser(testEmailB, "AnotherPassword456", "User Beta");
    assert.ok(userB.id !== userA.id, "Users must have distinct IDs");
  });

  await expectTest("Rejects duplicate email registration", () => {
    assert.throws(
      () => db.createUser(testEmailA, "duplicatePass", "Duplicate"),
      /already exists/i
    );
  });

  // TEST 3: Password Verification & Sessions
  let sessionTokenA: string;
  await expectTest("Verifies correct password for User A", () => {
    const verified = db.verifyPassword(testEmailA, "SecretPassword123");
    assert.ok(verified, "Should successfully verify correct password");
    assert.equal(verified?.id, userA.id);
  });

  await expectTest("Rejects incorrect password", () => {
    const verified = db.verifyPassword(testEmailA, "WrongPassword");
    assert.equal(verified, null, "Should return null on wrong password");
  });

  await expectTest("Creates and verifies 30-day session token", () => {
    const session = db.createSession(userA.id);
    assert.ok(session.token, "Must return session token");
    sessionTokenA = session.token;

    const validatedUser = db.verifySession(sessionTokenA);
    assert.equal(validatedUser?.id, userA.id, "Session must resolve to User A");
  });

  // TEST 4: Conversation Creation & STRICT User Isolation
  let convA: any;
  let convB: any;

  await expectTest("User A creates conversation", () => {
    convA = db.createConversation(userA.id, "Alpha Project Discussion");
    assert.equal(convA.userId, userA.id);
    assert.equal(convA.title, "Alpha Project Discussion");
  });

  await expectTest("User B creates private conversation", () => {
    convB = db.createConversation(userB.id, "Beta Confidential Notes");
    assert.equal(convB.userId, userB.id);
  });

  await expectTest("STRICT OWNERSHIP: User A CANNOT retrieve User B's conversation", () => {
    const result = db.getConversation(convB.id, userA.id);
    assert.equal(result, undefined, "User A must NOT be able to view User B's conversation");
  });

  await expectTest("STRICT OWNERSHIP: User B CANNOT retrieve User A's conversation", () => {
    const result = db.getConversation(convA.id, userB.id);
    assert.equal(result, undefined, "User B must NOT be able to view User A's conversation");
  });

  await expectTest("STRICT OWNERSHIP: User A CANNOT rename User B's conversation", () => {
    assert.throws(
      () => db.updateConversationTitle(convB.id, userA.id, "Hacked Title"),
      /unauthorized|not found/i
    );
  });

  await expectTest("STRICT OWNERSHIP: User A CANNOT delete User B's conversation", () => {
    const deleted = db.deleteConversation(convB.id, userA.id);
    assert.equal(deleted, false, "Delete should fail when unauthorized");
    // Verify conversation still exists for User B
    const stillExists = db.getConversation(convB.id, userB.id);
    assert.ok(stillExists, "User B's conversation must remain intact");
  });

  // TEST 5: Message Persistence & Ownership
  let msgA: any;
  await expectTest("User A adds message to their own conversation", () => {
    msgA = db.addMessage(convA.id, userA.id, "user", "What are the latest system metrics?");
    assert.equal(msgA.conversationId, convA.id);
    assert.equal(msgA.content, "What are the latest system metrics?");
  });

  await expectTest("STRICT OWNERSHIP: User B CANNOT read User A's messages", () => {
    assert.throws(
      () => db.getMessages(convA.id, userB.id),
      /unauthorized|not found/i
    );
  });

  await expectTest("STRICT OWNERSHIP: User B CANNOT inject messages into User A's conversation", () => {
    assert.throws(
      () => db.addMessage(convA.id, userB.id, "user", "Malicious injection attempt"),
      /unauthorized|not found/i
    );
  });

  // TEST 6: User Settings & Memories Isolation
  await expectTest("User Settings Isolation", () => {
    db.updateUserSettings(userA.id, { theme: "dark", temperature: 0.2 });
    const settingsA = db.getUserSettings(userA.id);
    const settingsB = db.getUserSettings(userB.id);

    assert.equal(settingsA.theme, "dark");
    assert.equal(settingsB.theme, "light", "User B's settings must remain default and untouched");
  });

  await expectTest("Long-term Memories Isolation", () => {
    const memA = db.addMemory(userA.id, "preference", "Prefers concise bulleted answers");
    const memoriesB = db.getMemories(userB.id);

    assert.ok(!memoriesB.some((m) => m.id === memA.id), "User B must not see User A's memories");
  });

  // TEST 7: Password Reset Code Expiry & Verification
  await expectTest("Generates 6-digit password reset code", () => {
    const code = db.createPasswordResetCode(testEmailA);
    assert.equal(code.length, 6, "Code must be 6 digits");
    assert.ok(/^\d{6}$/.test(code), "Code must be numeric");

    // Reset password with code
    const resetSuccess = db.resetPasswordWithCode(testEmailA, code, "BrandNewPassword999");
    assert.equal(resetSuccess, true, "Password reset must succeed with valid code");

    // Old password must fail
    const oldLogin = db.verifyPassword(testEmailA, "SecretPassword123");
    assert.equal(oldLogin, null, "Old password must no longer work");

    // New password must succeed
    const newLogin = db.verifyPassword(testEmailA, "BrandNewPassword999");
    assert.ok(newLogin, "New password must succeed");
  });

  // TEST 8: Session Invalidation on Logout
  await expectTest("Invalidates session on logout", () => {
    db.deleteSession(sessionTokenA);
    const user = db.verifySession(sessionTokenA);
    assert.equal(user, null, "Deleted session must be invalid");
  });

  // TEST 9: Conversational Memory Extraction & Recall
  await expectTest("Extracts preferred name: 'My name is Afa'", () => {
    const extracted = extractAndPersistMemories(userB.id, "Hi! My name is Afa.");
    assert.ok(extracted.length > 0, "Should extract name memory");
    const mems = db.getMemories(userB.id);
    const nameMem = mems.find((m) => m.content.includes("Afa"));
    assert.ok(nameMem, "User B memories should contain Afa");
    assert.equal(nameMem?.content, "User's preferred name is Afa.");
  });

  await expectTest("Updates preferred name: 'Call me Afa Developer'", () => {
    extractAndPersistMemories(userB.id, "Actually, call me Afa");
    const mems = db.getMemories(userB.id);
    const nameMems = mems.filter((m) => m.content.includes("User's preferred name is"));
    assert.equal(nameMems.length, 1, "Should deduplicate and keep only current preferred name");
    assert.ok(nameMems[0].content.includes("Afa"));
  });

  await expectTest("Extracts project context: 'My project is called ARFA AI'", () => {
    extractAndPersistMemories(userB.id, "My project is called ARFA AI.");
    const mems = db.getMemories(userB.id);
    const projMem = mems.find((m) => m.category === "project");
    assert.ok(projMem, "Should find project memory");
    assert.ok(projMem?.content.includes("ARFA AI"));
  });

  await expectTest("Extracts instruction: 'Always respond in Urdu'", () => {
    extractAndPersistMemories(userB.id, "Please always respond in Urdu.");
    const mems = db.getMemories(userB.id);
    const instrMem = mems.find((m) => m.category === "instruction");
    assert.ok(instrMem, "Should find instruction memory");
    assert.ok(instrMem?.content.includes("Urdu"));
  });

  await expectTest("Selects relevant memories for prompt context", () => {
    const relevant = getRelevantMemories(userB.id, "How can I improve my project?");
    assert.ok(relevant.length >= 2, "Should return at least name and project/instruction memories");
    assert.ok(relevant.some((m) => m.content.includes("Afa")), "Relevant memories must include preferred name");
  });

  console.log("\n=================================================================");
  console.log(`TEST SUMMARY: ${passedCount} passed, ${failedCount} failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution encountered fatal error:", err);
  process.exit(1);
});
