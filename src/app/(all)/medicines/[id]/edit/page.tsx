"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pill,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  FlaskConical,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { callApi } from "@/global/func";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const STATUS_OPTIONS: {
  value: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}[] = [
  {
    value: "active",
    label: "Active",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    desc: "Available and approved",
  },
  {
    value: "review",
    label: "Under Review",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    desc: "Being reviewed by admin",
  },
  {
    value: "warning",
    label: "Warning",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    desc: "Has known safety concerns",
  },
  {
    value: "inactive",
    label: "Inactive",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-300",
    desc: "Temporarily unavailable",
  },
  {
    value: "banned",
    label: "Banned",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    desc: "Prohibited from use",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Medicine {
  _id: string;
  genericName: string;
  availableForms: string[];
  requiresPrescription: boolean;
  status: string;
  description: DescriptionEntry[];
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

const getMedicineById = async (id: string): Promise<Medicine> => {
  const response = await callApi(`/medicine/${id}`, "GET");
  if (response.error) throw new Error(response.message);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

const updateMedicine = async ({ id, data }: { id: string; data: any }) => {
  const response = await callApi(
    `/medicine/update-medicine/${id}`,
    "PUT",
    data,
  );
  if (response.error)
    throw new Error(response.message || "Failed to update medicine");
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

export default function UpdateMedicinePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [genericName, setGenericName] = useState("");
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [status, setStatus] = useState("review");
  const [activeLang, setActiveLang] = useState<"english" | "bangla">("english");
  const [descriptions, setDescriptions] = useState<DescriptionEntry[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Fetch existing medicine data
  const {
    data: medicine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medicine", id],
    queryFn: () => getMedicineById(id),
    enabled: !!id,
  });

  // Populate form when data loads
  useEffect(() => {
    if (medicine && !initialized) {
      setGenericName(medicine.genericName || "");
      setAvailableForms(medicine.availableForms || []);
      setRequiresPrescription(medicine.requiresPrescription || false);
      setStatus(medicine.status || "review");
      setDescriptions(
        medicine.description?.length > 0
          ? medicine.description
          : [emptyDesc("english")],
      );
      setInitialized(true);
    }
  }, [medicine, initialized]);

  const mutation = useMutation({
    mutationFn: updateMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine", id] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setTimeout(() => router.push(`/medicines/${id}`), 1500);
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
    mutation.mutate({
      id,
      data: {
        genericName,
        availableForms,
        requiresPrescription,
        status,
        description: descriptions,
      },
    });
  };

  const currentDesc = getDesc(activeLang);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Medicine Not Found
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Update Medicine
              </h1>
              <p className="text-sm text-gray-500 capitalize">
                {medicine.genericName}
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

        {/* Status */}
        <FormSection
          title="Medicine Status"
          icon={<ShieldAlert className="h-4 w-4 text-blue-600" />}
        >
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Select the current approval and availability status for this
              medicine.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all ${
                    status === opt.value
                      ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm`
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {status === opt.value && (
                    <span
                      className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${
                        opt.value === "active"
                          ? "bg-emerald-500"
                          : opt.value === "review"
                            ? "bg-blue-500"
                            : opt.value === "warning"
                              ? "bg-amber-500"
                              : opt.value === "inactive"
                                ? "bg-gray-400"
                                : "bg-red-500"
                      }`}
                    />
                  )}
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-xs opacity-70 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected status preview */}
            {selectedStatus && (
              <div
                className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${selectedStatus.bg} ${selectedStatus.border} border`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${selectedStatus.color}`}
                >
                  Currently set to:
                </span>
                <span className={`text-xs font-medium ${selectedStatus.color}`}>
                  {selectedStatus.label} — {selectedStatus.desc}
                </span>
              </div>
            )}
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
                  label="Indications"
                  value={currentDesc.indications}
                  onChange={(v) => setDesc(activeLang, { indications: v })}
                  placeholder="What this medicine is used for..."
                />
                <TextArea
                  label="Side Effects"
                  value={currentDesc.sideEffects}
                  onChange={(v) => setDesc(activeLang, { sideEffects: v })}
                  placeholder="Known side effects..."
                />
                <TextArea
                  label="Dosage"
                  value={currentDesc.dosage}
                  onChange={(v) => setDesc(activeLang, { dosage: v })}
                  placeholder="Recommended dosage instructions..."
                />
                <TextArea
                  label="Storage Conditions"
                  value={currentDesc.storageConditions}
                  onChange={(v) =>
                    setDesc(activeLang, { storageConditions: v })
                  }
                  placeholder="How to store this medicine..."
                />
              </div>

              <TextArea
                label="Precautions & Warnings"
                value={currentDesc.precautionsAndWarnings}
                onChange={(v) =>
                  setDesc(activeLang, { precautionsAndWarnings: v })
                }
                placeholder="Important precautions and warnings..."
                rows={2}
              />

              <TextArea
                label="Overdose Effects"
                value={currentDesc.overdoseEffects}
                onChange={(v) => setDesc(activeLang, { overdoseEffects: v })}
                placeholder="Effects of overdose..."
                rows={2}
              />

              <TextArea
                label="Chemical Structure"
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
            Medicine updated successfully! Redirecting...
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
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
