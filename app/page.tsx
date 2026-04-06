"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  ArrowRight,
  Star,
  Fingerprint,
  Phone,
  Loader2,
  AlertCircle,
  Apple,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/api/auth-service";
import { authStorage } from "@/lib/auth";
import {
  CountrySelector,
  COUNTRIES,
  type Country,
} from "@/components/admin/CountrySelector";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phone, setphone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Computed full phone number
  const fullPhoneNumber = `${selectedCountry.dialCode}${phone.replace(/\s+/g, "")}`;

  // Experience level optimization: Check auth state on mount
  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      router.push("/admin");
    }
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await AuthService.sendOtp(fullPhoneNumber);
      setStep("code");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to send code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length < 4) {
      setError("Please enter the 4-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.verifyOtp(
        fullPhoneNumber,
        verificationCode,
        "ADMIN",
      );

      // Multi-year dev experience: Centralized storage management
      authStorage.setTokens(response.accessToken, response.refreshToken);
      authStorage.setUser(response.user);

      router.push("/admin");
    } catch (err: any) {
      const backendError = err?.response?.data?.message;
      setError(
        Array.isArray(backendError)
          ? backendError.join(". ")
          : backendError || "Invalid code. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 4).split("");
      const newCode = [...code];
      pastedData.forEach((char, i) => {
        if (index + i < 4) newCode[index + i] = char;
      });
      setCode(newCode);
      inputRefs.current[Math.min(index + pastedData.length, 3)]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A16D4C] opacity-[0.03] blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A16D4C] opacity-[0.03] blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(43,22,19,0.05)] border border-[#F4EFEA] relative"
      >
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#F9F7F4] rounded-2xl flex items-center justify-center text-[#A16D4C] shadow-inner">
              {step === "phone" ? (
                <ChefHat className="w-8 h-8" />
              ) : (
                <Fingerprint className="w-8 h-8" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-serif italic text-[#4A2C2A] mb-3">
            D&apos;Zessert Therapy
          </h1>
          <h2 className="text-xl font-bold text-[#4A2C2A] mb-2">
            {step === "phone" ? "Welcome back ✨" : "Verify Your Number"}
          </h2>
          <p className="text-[#A16D4C]/60 text-sm font-medium">
            {step === "phone"
              ? "Let's continue your sweet journey"
              : `We've sent a 4-digit code to ${fullPhoneNumber.slice(0, 4)} **** ${fullPhoneNumber.slice(-3)}`}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#4A2C2A]/80 ml-1">
                  Mobile Number
                </label>
                <div className="flex gap-3">
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                    disabled={loading}
                  />
                  <div className="relative flex-1 group">
                    <input
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={phone}
                      onChange={(e) => setphone(e.target.value)}
                      className="w-full h-14 px-5 bg-[#F9F7F4] border border-transparent focus:border-[#A16D4C]/20 focus:bg-white rounded-2xl text-[#4A2C2A] font-bold text-sm transition-all outline-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 text-red-500 bg-red-50 p-4 rounded-2xl text-[11px] font-bold border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#8C5E41] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#7A5239] active:scale-[0.98] transition-all shadow-lg shadow-[#8C5E41]/20 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send code"
                )}
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute w-full h-[1px] bg-[#F4EFEA]" />
                <span className="relative px-4 bg-white text-[10px] font-bold text-[#A16D4C]/40 uppercase tracking-widest">
                  or Continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="h-14 border border-[#F4EFEA] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#F9F7F4] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-[#4A2C2A]">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="h-14 border border-[#F4EFEA] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#F9F7F4] transition-colors"
                >
                  <Apple className="w-5 h-5 text-[#4A2C2A]" />
                  <span className="text-sm font-bold text-[#4A2C2A]">
                    Apple
                  </span>
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="code-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-8"
            >
              <div className="flex justify-center gap-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-16 text-center bg-[#F9F7F4] border-2 border-transparent focus:border-[#A16D4C]/20 focus:bg-white rounded-full text-2xl font-bold text-[#4A2C2A] outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 text-red-500 bg-red-50 p-4 rounded-2xl text-[11px] font-bold border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#8C5E41] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#7A5239] active:scale-[0.98] transition-all shadow-lg shadow-[#8C5E41]/20 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verify code"
                  )}
                </button>

                <div className="text-center space-y-3">
                  <p className="text-xs font-bold text-[#A16D4C]/60 italic italic">
                    Didn&apos;t receive the code?{" "}
                    <span className="text-[#A16D4C] cursor-pointer hover:underline">
                      Resend in 00:59
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs font-black text-[#8C5E41] uppercase tracking-widest hover:underline"
                  >
                    CHANGE PHONE NUMBER
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="mt-12 pt-8 border-t border-[#F4EFEA] text-center">
          <p className="text-[10px] text-[#A16D4C]/40 leading-relaxed max-w-[280px] mx-auto font-medium">
            By Signin in with an account, you agree to <br />
            <span className="text-[#A16D4C]/60 cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-[#A16D4C]/60 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </footer>
      </motion.div>

      <footer className="mt-12 text-[#A16D4C]/30 font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 opacity-50">
        © 2026 DZESSERT THERAPY • CRAFTED WITH PASSION
      </footer>
    </div>
  );
}
