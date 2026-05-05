"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { useUser } from "@/global/hook/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { callApi, callApiForm } from "@/global/func";

type SecurityQuestion = {
  question: string;
  answers: string;
};

type UserProfile = {
  name: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  logo?: string;
  password?: string;
  securityQuestion?: SecurityQuestion[];
};

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: userLoading } = useUser();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const res = await callApi("/user/profile", "GET");
      if (res.error) throw new Error(res.message);
      return res.data as UserProfile;
    },
    enabled: isAuthenticated,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<UserProfile>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "securityQuestion",
  });

  useEffect(() => {
    if (user && typeof user === "object" && "name" in user && "email" in user) {
      reset({
        name: (user as UserProfile).name,
        email: (user as UserProfile).email,
        gender: (user as UserProfile).gender,
        dateOfBirth: (user as UserProfile).dateOfBirth?.split("T")[0],
        phone: (user as UserProfile).phone,
        address: (user as UserProfile).address,
        securityQuestion: (user as UserProfile).securityQuestion || [],
      });
      setLogoPreview((user as UserProfile).logo || "/default-avatar.png");
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await callApiForm(`/user/profile`, "PATCH", formData);
      if (res.error) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    },
    onError: (error: Error) => {
      setError("root", { message: error.message });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: UserProfile) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "password" && !value) return;

      if (key === "securityQuestion" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    if (logoFile) formData.append("logo", logoFile);
    mutation.mutate(formData);
  };

  if (userLoading || isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!isAuthenticated) return <div>Please log in to edit your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Edit Profile
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update your personal information
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-t border-gray-200 px-4 py-5 sm:p-0"
          >
            <div className="space-y-6 px-4 py-5 sm:px-6">
              {errors.root && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-sm text-red-700">{errors.root.message}</p>
                </div>
              )}

              {/* Profile Logo Upload */}
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Profile Preview"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Not provided"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Not provided"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Recovery Questions Field */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Recovery Questions
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ question: "", answers: "" })}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Question
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-4 mb-4 items-start p-4 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Question
                        </label>
                        <input
                          {...register(
                            `securityQuestion.${index}.question` as const,
                            {
                              required: "Question is required",
                            },
                          )}
                          placeholder="e.g., What was the name of your first pet?"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors?.securityQuestion?.[index]?.question && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.securityQuestion[index]?.question?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Answer
                        </label>
                        <input
                          {...register(
                            `securityQuestion.${index}.answers` as const,
                            {
                              required: "Answer is required",
                            },
                          )}
                          placeholder="Enter your answer"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors?.securityQuestion?.[index]?.answers && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.securityQuestion[index]?.answers?.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium mt-6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Password Field */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                  })}
                  placeholder="Leave blank to keep current password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
