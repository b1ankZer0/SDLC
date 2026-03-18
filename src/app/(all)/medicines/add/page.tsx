"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pill,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  FlaskConical,
} from "lucide-react";
import { callApi } from "@/global/func";
import { useUser } from "@/global/hook/useUser";

// ─── Types ────────────────────────────────────────────────────────────────────

const AVAILABLE_FORMS = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "ointment",
  "suppository",
  "drop",
  "inhaler",
  "patch",
  "other",
];

const LANGUAGES = ["english", "bangla"] as const;

interface DescriptionEntry {
  language: "english" | "bangla";
  indications: string;
  precautionsAndWarnings: string;
  useInSpecialPopulations: { title: string; description: string }[];
  dosage: string;
  overdoseEffects: string;
  sideEffects: string;
  storageConditions: string;
  chemicalStructure: string;
}

const emptyDesc = (language: "english" | "bangla"): DescriptionEntry => ({
  language,
  indications: "",
  precautionsAndWarnings: "",
  useInSpecialPopulations: [{ title: "", description: "" }],
  dosage: "",
  overdoseEffects: "",
  sideEffects: "",
  storageConditions: "",
  chemicalStructure: "",
});

// ─── API ──────────────────────────────────────────────────────────────────────

const createMedicine = async (data: any) => {
  const response = await callApi("/medicine/add-medicine", "POST", data);
  if (response.error)
    throw new Error(response.message || "Failed to create medicine");
  return response.data;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-blue-50 rounded-lg">{icon}</div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddMedicinePage() {
  const router = useRouter();
  const { user } = useUser();

  const [genericName, setGenericName] = useState("");
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [activeLang, setActiveLang] = useState<"english" | "bangla">("english");
  const [descriptions, setDescriptions] = useState<DescriptionEntry[]>([
    emptyDesc("english"),
  ]);

  const mutation = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => {
      setTimeout(() => router.push("/medicines"), 1500);
    },
  });

  // ── Description helpers ──

  const getDesc = (lang: "english" | "bangla") =>
    descriptions.find((d) => d.language === lang);

  const setDesc = (
    lang: "english" | "bangla",
    patch: Partial<DescriptionEntry>,
  ) => {
    setDescriptions((prev) => {
      const exists = prev.find((d) => d.language === lang);
      if (exists) {
        return prev.map((d) => (d.language === lang ? { ...d, ...patch } : d));
      }
      return [...prev, { ...emptyDesc(lang), ...patch }];
    });
  };

  const updatePopulation = (
    lang: "english" | "bangla",
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const desc = getDesc(lang);
    if (!desc) return;
    const updated = desc.useInSpecialPopulations.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    setDesc(lang, { useInSpecialPopulations: updated });
  };

  const addPopulation = (lang: "english" | "bangla") => {
    const desc = getDesc(lang) || emptyDesc(lang);
    setDesc(lang, {
      useInSpecialPopulations: [
        ...desc.useInSpecialPopulations,
        { title: "", description: "" },
      ],
    });
  };

  const removePopulation = (lang: "english" | "bangla", index: number) => {
    const desc = getDesc(lang);
    if (!desc) return;
    setDesc(lang, {
      useInSpecialPopulations: desc.useInSpecialPopulations.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const toggleForm = (form: string) => {
    setAvailableForms((prev) =>
      prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form],
    );
  };

  const enableLang = (lang: "english" | "bangla") => {
    if (!getDesc(lang)) {
      setDescriptions((prev) => [...prev, emptyDesc(lang)]);
    }
    setActiveLang(lang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !genericName ||
      availableForms.length === 0 ||
      descriptions.length === 0
    )
      return;
    mutation.mutate({
      genericName,
      availableForms,
      requiresPrescription,
      description: descriptions,
    });
  };

  const currentDesc = getDesc(activeLang);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Add New Medicine
              </h1>
              <p className="text-sm text-gray-500">
                Fill in the details to add a medicine to the database
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 py-6 space-y-5"
      >
        {/* Basic Info */}
        <FormSection
          title="Basic Information"
          icon={<Pill className="h-4 w-4 text-blue-600" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Generic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Paracetamol, Amoxicillin..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Forms <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FORMS.map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => toggleForm(form)}
                    className={`px-3 py-1.5 text-sm rounded-lg border capitalize font-medium transition-colors ${
                      availableForms.includes(form)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="prescription"
                checked={requiresPrescription}
                onChange={(e) => setRequiresPrescription(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="prescription"
                className="text-sm font-medium text-gray-700"
              >
                Requires Prescription (Rx)
              </label>
            </div>
          </div>
        </FormSection>

        {/* Descriptions */}
        <FormSection
          title="Medical Information"
          icon={<FlaskConical className="h-4 w-4 text-blue-600" />}
        >
          {/* Language tabs */}
          <div className="flex gap-2 mb-5">
            {LANGUAGES.map((lang) => {
              const hasData = !!getDesc(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => enableLang(lang)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border capitalize transition-colors ${
                    activeLang === lang
                      ? "bg-blue-600 text-white border-blue-600"
                      : hasData
                        ? "border-blue-200 text-blue-700 bg-blue-50"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {lang}
                  {hasData && activeLang !== lang && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {currentDesc && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <TextArea
                  label="Indications *"
                  value={currentDesc.indications}
                  onChange={(v) => setDesc(activeLang, { indications: v })}
                  placeholder="What this medicine is used for..."
                />
                <TextArea
                  label="Side Effects *"
                  value={currentDesc.sideEffects}
                  onChange={(v) => setDesc(activeLang, { sideEffects: v })}
                  placeholder="Known side effects..."
                />
                <TextArea
                  label="Dosage *"
                  value={currentDesc.dosage}
                  onChange={(v) => setDesc(activeLang, { dosage: v })}
                  placeholder="Recommended dosage instructions..."
                />
                <TextArea
                  label="Storage Conditions *"
                  value={currentDesc.storageConditions}
                  onChange={(v) =>
                    setDesc(activeLang, { storageConditions: v })
                  }
                  placeholder="How to store this medicine..."
                />
              </div>

              <TextArea
                label="Precautions & Warnings *"
                value={currentDesc.precautionsAndWarnings}
                onChange={(v) =>
                  setDesc(activeLang, { precautionsAndWarnings: v })
                }
                placeholder="Important precautions and warnings..."
                rows={2}
              />

              <TextArea
                label="Overdose Effects *"
                value={currentDesc.overdoseEffects}
                onChange={(v) => setDesc(activeLang, { overdoseEffects: v })}
                placeholder="Effects of overdose..."
                rows={2}
              />

              <TextArea
                label="Chemical Structure *"
                value={currentDesc.chemicalStructure}
                onChange={(v) => setDesc(activeLang, { chemicalStructure: v })}
                placeholder="Chemical formula or structural description..."
                rows={2}
              />

              {/* Special Populations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Use in Special Populations
                  </label>
                  <button
                    type="button"
                    onClick={() => addPopulation(activeLang)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Population
                  </button>
                </div>

                <div className="space-y-3">
                  {currentDesc.useInSpecialPopulations.map((pop, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Population (e.g. Pregnant women)"
                          value={pop.title}
                          onChange={(e) =>
                            updatePopulation(
                              activeLang,
                              i,
                              "title",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={pop.description}
                          onChange={(e) =>
                            updatePopulation(
                              activeLang,
                              i,
                              "description",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePopulation(activeLang, i)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </FormSection>

        {/* Errors / Success */}
        {mutation.error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {(mutation.error as Error).message}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Medicine added successfully! Redirecting...
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              mutation.isPending || !genericName || availableForms.length === 0
            }
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Medicine
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
