import { db, MemoryItem } from "../db.ts";

/**
 * Extracts personal preferences, names, and stable facts from a user message
 * and persists them to long-term memory.
 */
export function extractAndPersistMemories(
  userId: string,
  userMessage: string
): MemoryItem[] {
  if (!userMessage || !userMessage.trim()) return [];

  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const addedMemories: MemoryItem[] = [];

  const existingMemories = db.getMemories(userId);

  // 1. Preferred Name Extraction (English, Roman Urdu, Urdu-friendly)
  // e.g. "My name is Afa", "Call me Afa", "I am Afa", "Mera naam Afa hai", "Mujhe Afa kehna"
  const nameMatch =
    text.match(/(?:(?:my name is|call me|i am|i'm)\s+([A-Z][a-zA-Z0-9_\s]{1,24}))/i) ||
    text.match(/(?:mera naam\s+([A-Za-z0-9_\s]{1,24})\s+hai)/i) ||
    text.match(/(?:mujhe\s+([A-Za-z0-9_\s]{1,24})\s+kehna)/i);

  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim().replace(/[.,!?;:]+$/, "");
    // Filter out common false positives like "i am happy", "i am working", "call me later"
    const lowerName = rawName.toLowerCase();
    const commonWords = ["happy", "fine", "sad", "busy", "working", "tired", "back", "later", "again", "here", "ready"];
    if (!commonWords.includes(lowerName) && rawName.length <= 25) {
      // Check if existing name memory exists
      const existingNameMem = existingMemories.find((m) =>
        m.content.toLowerCase().includes("user prefers to be called") ||
        m.content.toLowerCase().includes("user's preferred name is")
      );

      const content = `User's preferred name is ${rawName}.`;
      if (existingNameMem) {
        // Delete old and replace with new
        db.deleteMemory(existingNameMem.id, userId);
      }
      const newMem = db.addMemory(userId, "preference", content);
      addedMemories.push(newMem);
    }
  }

  // 2. Project or Work Context
  // e.g. "My project is called ARFA AI", "I'm building an AI assistant called XYZ"
  const projectMatch =
    text.match(/(?:my project is(?: called)?\s+["']?([A-Za-z0-9\s_\-]{2,40})["']?)/i) ||
    text.match(/(?:i am working on|i'm working on|i am building|i'm building)\s+["']?([A-Za-z0-9\s_\-]{2,40})["']?/i);

  if (projectMatch && projectMatch[1]) {
    const projectName = projectMatch[1].trim().replace(/[.,!?;:]+$/, "");
    const lowerProj = projectName.toLowerCase();
    const skipList = ["it", "this", "something", "a project", "the code"];
    if (!skipList.includes(lowerProj) && projectName.length >= 2) {
      const content = `User is working on project: ${projectName}.`;
      const isAlreadySaved = existingMemories.some((m) => m.content.toLowerCase() === content.toLowerCase());
      if (!isAlreadySaved) {
        const newMem = db.addMemory(userId, "project", content);
        addedMemories.push(newMem);
      }
    }
  }

  // 3. Explicit Instruction or Persistent Preference
  // e.g. "Please remember that I prefer TypeScript", "Always respond in Urdu"
  const rememberMatch =
    text.match(/(?:(?:please\s+)?remember that\s+([^.!?\n]{5,150}))/i) ||
    text.match(/(?:always respond in\s+([A-Za-z\s]{3,30}))/i) ||
    text.match(/(?:i prefer\s+([^.!?\n]{5,100}))/i);

  if (rememberMatch && rememberMatch[1]) {
    const detail = rememberMatch[1].trim().replace(/[.,!?;:]+$/, "");
    // Check if user is asking to respond in a language
    if (text.toLowerCase().includes("always respond in")) {
      const content = `User preference: Always respond in ${detail}.`;
      const isAlreadySaved = existingMemories.some((m) => m.content.toLowerCase().includes("always respond in"));
      if (!isAlreadySaved) {
        const newMem = db.addMemory(userId, "instruction", content);
        addedMemories.push(newMem);
      }
    } else if (detail.length >= 5) {
      const content = `User preference: ${detail}.`;
      const isAlreadySaved = existingMemories.some((m) => m.content.toLowerCase() === content.toLowerCase());
      if (!isAlreadySaved) {
        const newMem = db.addMemory(userId, "preference", content);
        addedMemories.push(newMem);
      }
    }
  }

  return addedMemories;
}

/**
 * Selects only relevant and essential memories to inject into the system prompt,
 * avoiding token bloat while guaranteeing preferred names & core context are present.
 */
export function getRelevantMemories(
  userId: string,
  _currentMessage: string = ""
): Array<{ category: string; content: string }> {
  const allMemories = db.getMemories(userId);
  if (allMemories.length === 0) return [];

  // Always include preferred name & instructions
  const priorityMemories = allMemories.filter(
    (m) =>
      m.category === "instruction" ||
      m.content.toLowerCase().includes("user's preferred name is") ||
      m.content.toLowerCase().includes("user prefers to be called")
  );

  // Other memories up to a max total of 8
  const otherMemories = allMemories.filter((m) => !priorityMemories.includes(m));
  const selected = [...priorityMemories, ...otherMemories].slice(0, 8);

  return selected.map((m) => ({ category: m.category, content: m.content }));
}
