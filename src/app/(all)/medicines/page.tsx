"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Pill,
  ChevronRight,
  AlertCircle,
  Loader2,
  FlaskConical,
  Tablets,
  Syringe,
  Wind,
  Package,
} from "lucide-react";
import { callApi } from "@/global/func";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Medicine {
  _id: string;
  genericName: string;
  availableForms: string[];
  requiresPrescription: boolean;
  status: "active" | "warning" | "inactive" | "review" | "banned";
  description: {
    language: string;
    indications: string;
    sideEffects: string;
  }[];
  newsCount?: number;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const getAllMedicines = async (): Promise<Medicine[]> => {
  const response = await callApi("/medicine/all-medicine", "GET");
  if (response.error)
    throw new Error(response.message || "Failed to fetch medicines");
  return response.data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FORM_ICONS: Record<string, React.ReactNode> = {
  tablet: <Tablets className="h-3 w-3" />,
  capsule: <Pill className="h-3 w-3" />,
  injection: <Syringe className="h-3 w-3" />,
  inhaler: <Wind className="h-3 w-3" />,
  syrup: <FlaskConical className="h-3 w-3" />,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  review: "bg-blue-50 text-blue-700 border border-blue-200",
  inactive: "bg-gray-100 text-gray-500 border border-gray-200",
  banned: "bg-red-50 text-red-700 border border-red-200",
};

const FORM_FILTERS = [
  "all",
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "inhaler",
  "patch",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicinesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [formFilter, setFormFilter] = useState("all");
  const [prescriptionFilter, setPrescriptionFilter] = useState<
    "all" | "yes" | "no"
  >("all");

  const {
    data: medicines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
  });

  const filtered = medicines.filter((m) => {
    const matchSearch = m.genericName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchForm =
      formFilter === "all" || m.availableForms.includes(formFilter);
    const matchRx =
      prescriptionFilter === "all" ||
      (prescriptionFilter === "yes" && m.requiresPrescription) ||
      (prescriptionFilter === "no" && !m.requiresPrescription);
    return matchSearch && matchForm && matchRx;
  });

  const englishDesc = (m: Medicine) =>
    m.description.find((d) => d.language === "english") || m.description[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medicine Database
            </h1>
          </div>
          <p className="text-gray-500 ml-12">
            Browse and search our comprehensive medicine reference library
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Filters ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by generic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Form filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Form:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FORM_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormFilter(f)}
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                      formFilter === f
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription filter */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Prescription:
              </span>
              {(["all", "yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPrescriptionFilter(v)}
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                    prescriptionFilter === v
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {v === "yes" ? "Required" : v === "no" ? "OTC" : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} medicine{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* ── States ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Failed to load medicines. Please try again.
            </p>
          </div>
        )}

        {/* ── Grid ── */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((medicine) => {
              const desc = englishDesc(medicine);
              return (
                <button
                  key={medicine._id}
                  onClick={() => router.push(`/medicines/${medicine._id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      {medicine.requiresPrescription && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                          Rx
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[medicine.status]}`}
                      >
                        {medicine.status}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1 capitalize">
                    {medicine.genericName}
                  </h3>

                  {/* Indications preview */}
                  {desc && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {desc.indications}
                    </p>
                  )}

                  {/* Available forms */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {medicine.availableForms.slice(0, 4).map((form) => (
                      <span
                        key={form}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md capitalize"
                      >
                        {FORM_ICONS[form] || <Package className="h-3 w-3" />}
                        {form}
                      </span>
                    ))}
                    {medicine.availableForms.length > 4 && (
                      <span className="px-2 py-0.5 text-xs text-gray-400 bg-gray-50 rounded-md">
                        +{medicine.availableForms.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {medicine.newsCount !== undefined && (
                        <span className="text-xs text-gray-400">
                          {medicine.newsCount} news article
                          {medicine.newsCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                          medicine.requiresPrescription
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {medicine.requiresPrescription ? "Rx" : "OTC"}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <Pill className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No medicines match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
