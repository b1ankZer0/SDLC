"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callApi } from "@/global/func";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Globe, Save, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingItem {
  timeZone: string;
}

const TIME_ZONES = [
  { label: "(GMT -12:00) Eniwetok, Kwajalein", value: "-12:00" },
  { label: "(GMT -05:00) Eastern Time (US & Canada)", value: "-05:00" },
  { label: "(GMT +00:00) Western Europe Time, London", value: "+00:00" },
  { label: "(GMT +05:30) Bombay, Calcutta, New Delhi", value: "+05:30" },
  { label: "(GMT +06:00) Almaty, Dhaka, Colombo", value: "+06:00" },
  { label: "(GMT +09:00) Tokyo, Seoul, Osaka", value: "+09:00" },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [currentTimeZone, setCurrentTimeZone] = useState<string>("+06:00");

  const {
    data: settingsArray,
    isLoading,
    error,
  } = useQuery<SettingItem[]>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const res = await callApi("/user/getSettings", "GET");
      if (res.error) throw new Error(res.message);
      return res.data;
    },
  });

  useEffect(() => {
    if (settingsArray && settingsArray.length > 0) {
      setCurrentTimeZone(settingsArray[0].timeZone);
    }
  }, [settingsArray]);

  const mutation = useMutation({
    mutationFn: (updatedSettings: SettingItem[]) =>
      callApi("/user/setSettings", "POST", updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  const handleSave = () => {
    // Wrapping the object in an array to match your schema requirements
    const payload: SettingItem[] = [{ timeZone: currentTimeZone }];
    mutation.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Regional Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Configure your localization preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Time & Language</h3>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-md">
                  <p className="font-medium text-gray-900">Display Time Zone</p>
                  <p className="text-sm text-gray-500">
                    This affects how appointment times and medical records are
                    timestamped in your dashboard.
                  </p>
                </div>

                <div className="w-full md:w-72">
                  <select
                    value={currentTimeZone}
                    onChange={(e) => setCurrentTimeZone(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all"
                  >
                    {TIME_ZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Status and Action Area */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              {mutation.isSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium animate-in fade-in duration-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Preferences updated
                </div>
              )}
              {mutation.isError && (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Update failed
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
