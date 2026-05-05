"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/global/func";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Challenge
  const [challenge, setChallenge] = useState<{
    QsNo: number;
    question: string;
  } | null>(null);
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1: Fetch Question
  const getQuestionMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await callApi("/user/forgot-password", "post", { email });
      if (res.error) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (data) => {
      setChallenge(data);
      setStep(2);
    },
    onError: (err: any) => setError(err.message),
  });

  // Step 2: Verify Answer and Reset Password
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await callApi("/user/forgot-password-verification", "post", {
        email,
        answer,
        newPassword,
        QsNo: challenge?.QsNo,
      });
      if (res.error) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => setSuccess(true),
    onError: (err: any) => setError(err.message),
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    getQuestionMutation.mutate(email);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verifyMutation.mutate();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Side Info Section */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-4">Account Recovery</h3>
          <p className="text-blue-100 mb-8">
            {step === 1
              ? "Provide your email to find your security challenge."
              : "Please answer your security question correctly to set a new password."}
          </p>
          <div className="bg-blue-500/30 p-6 rounded-lg border border-blue-500/50 text-sm">
            <h4 className="font-medium mb-2">Security Note</h4>
            <p className="text-blue-100">
              Answers are not case-sensitive but must be exact.
            </p>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-500 mb-6">Step {step} of 2</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your account email"
                />
              </div>
              <button
                type="submit"
                disabled={getQuestionMutation.isPending}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {getQuestionMutation.isPending
                  ? "Finding User..."
                  : "Fetch Security Question"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Security Question:
                </p>
                <p className="text-gray-800 font-medium">
                  {challenge?.question}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Answer
                </label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500"
                  placeholder="Type your answer here"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {verifyMutation.isPending ? "Verifying..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:underline"
              >
                Back to email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
