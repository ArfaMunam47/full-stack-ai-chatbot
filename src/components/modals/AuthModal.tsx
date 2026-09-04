import React, { useState, useEffect } from "react";
import { X, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import { api } from "../../lib/api.ts";
import { User } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: "login" | "register" | "forgot";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setInfoMessage(null);
      setCodeSent(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please enter both email and password.");
        }
        const user = await api.login(email.trim(), password);
        onSuccess(user);
        onClose();
      } else if (mode === "register") {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please enter an email and password.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        const user = await api.register(email.trim(), password, name.trim() || "Explorer");
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your account email.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setCodeSent(true);
      setInfoMessage(`A 6-digit recovery code has been generated. Code: ${res.code || "Check email"}`);
      if (res.code) {
        setResetCode(res.code);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to generate recovery code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !resetCode.trim() || !newPassword.trim()) {
      setError("Please complete all recovery fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.resetPassword(email.trim(), resetCode.trim(), newPassword);
      setInfoMessage("Password reset successfully. You may now log in.");
      setTimeout(() => {
        setMode("login");
        setCodeSent(false);
        setPassword(newPassword);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed. Verify your code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

      if ((window as any).google?.accounts?.id && googleClientId) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              const user = await api.googleAuth({ credential: response.credential });
              onSuccess(user);
              onClose();
            } catch (authErr: any) {
              setError(authErr.message || "Google authentication failed.");
            } finally {
              setLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        const demoEmail = email.trim() || `google_user_${Math.random().toString(36).substring(2, 7)}@gmail.com`;
        const user = await api.googleAuth({
          email: demoEmail,
          name: name.trim() || "Google User",
          googleId: `goog_${Date.now()}`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        });
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      const guestUser = await api.getCurrentUser();
      onSuccess(guestUser);
      onClose();
    } catch {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="tactile-card relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {mode === "forgot" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="p-1 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold tracking-tight text-[#1F130B] dark:text-[#FAF6F0]">
                Reset Password
              </h2>
            </div>

            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] mb-5">
              {!codeSent
                ? "Enter your account email to generate a secure recovery code."
                : "Enter the 6-digit code and your new password to restore access."}
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#1E140C] border border-[#DDD1C2] dark:border-[#3E291C] text-[#9E3624] dark:text-[#F0806E] text-xs mb-4 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs mb-4 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {!codeSent ? (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] mb-1.5">
                    Account Email
                  </label>
                  <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                    <Mail className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tactile-espresso w-full py-2.5 rounded-xl font-semibold text-xs text-[#FAF6F0] cursor-pointer active:scale-95 transition-transform shadow-xs"
                >
                  {loading ? "Issuing Code..." : "Send Recovery Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                    <KeyRound className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] mb-1.5">
                    New Password (min 6 chars)
                  </label>
                  <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                    <Lock className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tactile-espresso w-full py-2.5 rounded-xl font-semibold text-xs text-[#FAF6F0] cursor-pointer active:scale-95 transition-transform shadow-xs"
                >
                  {loading ? "Updating..." : "Confirm Password Reset"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <ArfaLogo size="sm" showText={false} />
              <h2 className="text-lg font-bold tracking-tight text-[#1F130B] dark:text-[#FAF6F0]">
                {mode === "login" ? "Welcome back to Arfa AI" : "Create your Arfa account"}
              </h2>
            </div>

            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] mb-6">
              {mode === "login"
                ? "Sign in to access your persistent conversations, custom AI memories, and tailored voice models."
                : "Join Arfa AI for persistent memory, multi-device sync, and full personalization."}
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F5EFEB] dark:bg-[#1E140C] border border-[#DDD1C2] dark:border-[#3E291C] text-[#9E3624] dark:text-[#F0806E] text-xs mb-4 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Option */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="tactile-raised w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#1F130B] dark:text-[#FAF6F0] cursor-pointer mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#E5DDD3] dark:border-[#332217] w-full" />
              <span className="bg-[#FCFAF7] dark:bg-[#170E08] px-2 text-[10px] uppercase font-semibold text-[#8C7563] dark:text-[#A89584] tracking-wider relative">
                Or with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] mb-1.5">
                    Your Name
                  </label>
                  <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                    <UserIcon className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Taylor"
                      required
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] mb-1.5">
                  Email
                </label>
                <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                  <Mail className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setInfoMessage(null);
                      }}
                      className="text-[11px] text-[#2E1B10] dark:text-[#FAF6F0] underline cursor-pointer font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="tactile-recessed rounded-xl flex items-center px-3.5 py-2.5">
                  <Lock className="w-4 h-4 text-[#8C7563] dark:text-[#A89584] mr-2.5 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="tactile-espresso w-full py-2.5 rounded-xl font-semibold text-xs text-[#FAF6F0] cursor-pointer active:scale-95 transition-transform mt-2 shadow-xs"
              >
                {loading
                  ? "Processing..."
                  : mode === "login"
                  ? "Sign in with Email"
                  : "Create Account"}
              </button>
            </form>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E5DDD3] dark:border-[#332217] text-xs text-[#543D2B] dark:text-[#D8C9BC]">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-[#2E1B10] dark:text-[#FAF6F0] font-semibold underline cursor-pointer"
              >
                {mode === "login"
                  ? "Need an account? Register"
                  : "Already have an account? Sign in"}
              </button>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="hover:text-[#1F130B] dark:hover:text-[#FAF6F0] transition-colors cursor-pointer font-medium"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
