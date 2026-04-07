"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
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

  // Computed full phone number using selected country dial code
  const fullPhoneNumber = `${selectedCountry.dialCode}${phone.replace(/\s+/g, "")}`;

  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      router.push("/admin");
    }
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
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
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="w-full max-w-[440px] relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8 md:p-10 rounded-eight border border-outline-variant/10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center mb-10"
            >
              <div className="w-32 h-32 mb-6 relative group">
                <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all duration-700"></div>
                <img
                  alt="D'Zessert Therapy Logo"
                  className="w-full h-full object-contain relative z-10"
                  src="/dzessertTherapy.png"
                />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-on-surface tracking-tight text-center italic">
                {step === "phone" ? "Welcome Back" : "Verify Number"}
              </h1>
              <p className="text-on-surface-variant mt-2 text-sm tracking-wide font-light">
                {step === "phone"
                  ? "Step into your sensory sanctuary."
                  : `Sensory code sent to ${fullPhoneNumber}`}
              </p>
            </motion.div>
            {step === "phone" ? (
              <motion.form
                key="phone-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label
                    className="block text-[11px] uppercase tracking-[0.15em] font-bold text-amber-800 ml-1"
                    htmlFor="mobile"
                  >
                    Mobile Number
                  </label>
                  <div className="flex gap-3">
                    <CountrySelector
                      selectedCountry={selectedCountry}
                      onSelect={setSelectedCountry}
                      disabled={loading}
                    />
                    <div className="relative flex-1">
                      <input
                        className="w-full h-14 px-5 bg-white border border-neutral-200 rounded-xl text-sm focus:border-brand-500 focus:ring-0 transition-all outline-none placeholder:text-neutral-300 font-bold"
                        id="mobile"
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={phone}
                        onChange={(e) => setphone(e.target.value)}
                        required
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-[11px] font-bold rounded-lg flex items-center gap-2 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}

                <button
                  className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="code-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
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
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center bg-stone-50 border border-neutral-200 focus:border-brand-500 focus:ring-1 focus:ring-amber-600 rounded-full text-xl font-bold text-neutral-800 outline-none transition-all placeholder:text-transparent"
                      disabled={loading}
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-[11px] font-bold rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-300"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-xs font-bold text-amber-600 hover:underline uppercase tracking-widest"
                    >
                      Change Number
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Links */}
        {/* <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center space-y-6"
        >
          <p className="text-neutral-400 text-sm">
            New to the sanctuary? {" "}
            <a className="text-brand-600 font-bold hover:text-brand-700 underline underline-offset-4 decoration-brand-200" href="#">Register now</a>
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <a className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-brand-500 transition-colors font-bold" href="#">Privacy Policy</a>
            <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
            <a className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-brand-500 transition-colors font-bold" href="#">Terms of Service</a>
          </div>
        </motion.div> */}
      </main>
    </div>
  );
}
