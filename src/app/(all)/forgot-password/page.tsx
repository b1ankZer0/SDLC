"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/global/func";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const response = await callApi("/user/forgot-password", "post", {
        email,
      });
      if (response.error) {
        throw new Error(response.message || "Password reset request failed");
      }
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    resetPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Image/Info */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Reset Your Password</h3>
            <p className="text-blue-100">
              Don't worry, it happens to the best of us. Enter your email
              address and we'll send you instructions to reset your password.
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-blue-500/30 p-6 rounded-lg border border-blue-500/50">
              <h4 className="font-medium text-lg mb-2">Account Security Tip</h4>
              <p className="text-blue-100">
                Make sure to use a strong, unique password for your health
                account. Consider using a password manager to keep track of
                different passwords across websites.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Forgot Password
            </h2>
            <p className="text-gray-500 mt-2">Reset your account password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <p className="font-medium">Reset email sent!</p>
                <p className="mt-1 text-sm">
                  We've sent instructions to reset your password to {email}.
                  Please check your inbox and follow the link in the email.
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your account email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    resetPasswordMutation.isPending
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {resetPasswordMutation.isPending
                    ? "Sending..."
                    : "Send Reset Instructions"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
