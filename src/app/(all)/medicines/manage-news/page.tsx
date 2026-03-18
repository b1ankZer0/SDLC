"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Newspaper,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { callApi } from "@/global/func";
import { useUser } from "@/global/hook/useUser";
import { useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  _id: string;
  status: "true" | "checking" | "false";
  newsType: "posative" | "negative" | "neutral";
  news: string;
  references: string;
  createdAt: string;
  medicinesRef: string | { _id: string; genericName: string };
}

// ─── API ──────────────────────────────────────────────────────────────────────

const getAllCheckingNews = async (): Promise<NewsItem[]> => {
  const response = await callApi("/medicine/all-news/checking", "GET");
  if (response.error) throw new Error(response.message);
  const raw = response.data as any;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
};

const updateNews = async ({
  id,
  data,
}: {
  id: string;
  data: {
    status?: string;
    newsType?: string;
    news?: string;
    references?: string;
  };
}) => {
  const response = await callApi(`/medicine/update-news/${id}`, "PUT", data);
  if (response.error) throw new Error(response.message);
  return response.data;
};

const deleteNews = async (id: string) => {
  const response = await callApi(`/medicine/news/${id}`, "DELETE");
  if (response.error) throw new Error(response.message);
  return response.data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NEWS_TYPE_ICON: Record<string, React.ReactNode> = {
  posative: <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />,
  negative: <ThumbsDown className="h-3.5 w-3.5 text-red-500" />,
  neutral: <Minus className="h-3.5 w-3.5 text-gray-400" />,
};

const NEWS_TYPE_LABEL: Record<string, string> = {
  posative: "Positive",
  negative: "Negative",
  neutral: "Neutral",
};

const STATUS_CONFIG = {
  true: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    label: "Verified",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  checking: {
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  false: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    label: "Rejected",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

const STATUS_FILTERS = ["all", "checking", "true", "false"] as const;
const TYPE_FILTERS = ["all", "posative", "negative", "neutral"] as const;

// ─── Quick Action Row ─────────────────────────────────────────────────────────

function QuickActions({
  item,
  medicineId,
}: {
  item: NewsItem;
  medicineId: string;
}) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (status: string) =>
      updateNews({ id: item._id, data: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageNews", medicineId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNews(item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageNews", medicineId] });
      setConfirmDelete(false);
    },
  });

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-red-700">Confirm delete?</span>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleteMutation.isPending ? "..." : "Delete"}
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          className="px-2.5 py-1 text-xs border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      {item.status !== "true" && (
        <button
          onClick={() => updateMutation.mutate("true")}
          disabled={updateMutation.isPending}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          <CheckCircle className="h-3 w-3" />
          Verify
        </button>
      )}
      {item.status !== "checking" && (
        <button
          onClick={() => updateMutation.mutate("checking")}
          disabled={updateMutation.isPending}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 disabled:opacity-50 transition-colors"
        >
          <Clock className="h-3 w-3" />
          Set Pending
        </button>
      )}
      {item.status !== "false" && (
        <button
          onClick={() => updateMutation.mutate("false")}
          disabled={updateMutation.isPending}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-3 w-3" />
          Reject
        </button>
      )}
      <button
        onClick={() => setConfirmDelete(true)}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors ml-auto"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>

      {updateMutation.isPending && (
        <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
      )}
    </div>
  );
}

// ─── News Row ─────────────────────────────────────────────────────────────────

function NewsRow({ item }: { item: NewsItem }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (status: string) =>
      updateNews({ id: item._id, data: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkingNews"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNews(item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkingNews"] });
      setConfirmDelete(false);
    },
  });

  const medicineName =
    typeof item.medicinesRef === "object"
      ? item.medicinesRef.genericName
      : item.medicinesRef;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{NEWS_TYPE_ICON[item.newsType]}</div>

        <div className="flex-1 min-w-0">
          {/* Top row: badges + date */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${STATUS_CONFIG[item.status].badge}`}
            >
              {STATUS_CONFIG[item.status].icon}
              {STATUS_CONFIG[item.status].label}
            </span>
            <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full">
              {NEWS_TYPE_LABEL[item.newsType]}
            </span>
            {medicineName && (
              <Link
                href={`/medicines/${typeof item.medicinesRef === "object" ? item.medicinesRef._id : item.medicinesRef}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full capitalize hover:bg-blue-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {medicineName}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </Link>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-800 leading-relaxed mb-2">
            {item.news}
          </p>

          {/* Reference */}
          <a
            href={item.references}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-sm"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            {item.references}
          </a>

          {/* Go to medicine detail */}
          <div className="mt-2">
            <Link
              href={`/medicines/${typeof item.medicinesRef === "object" ? item.medicinesRef._id : item.medicinesRef}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Go to Medicine Page
            </Link>
          </div>

          {/* Actions */}
          {confirmDelete ? (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-red-700">Confirm delete?</span>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? "..." : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-xs border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {item.status !== "true" && (
                <button
                  onClick={() => updateMutation.mutate("true")}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="h-3 w-3" /> Verify
                </button>
              )}
              {item.status !== "false" && (
                <button
                  onClick={() => updateMutation.mutate("false")}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-3 w-3" /> Reject
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors ml-auto"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
              {updateMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManageNewsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (user && user.role !== "sudo" && user.role !== "admin") {
      router.replace("/medicines");
    }
  }, [user, router]);

  const {
    data: newsItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["checkingNews"],
    queryFn: getAllCheckingNews,
  });

  const filtered = newsItems.filter((item) => {
    const matchType = typeFilter === "all" || item.newsType === typeFilter;
    const matchSearch =
      search === "" ||
      item.news.toLowerCase().includes(search.toLowerCase()) ||
      item.references.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">News Review</h1>
                <p className="text-sm text-gray-500">
                  Pending submissions waiting for verification
                </p>
              </div>
            </div>

            {/* Summary badge */}
            {!isLoading && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {newsItems.length} pending review
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* ── Filter bar ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search news content or references..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">
              Type:
            </span>
            {TYPE_FILTERS.map((t) => {
              const labels: Record<string, string> = {
                all: "All",
                posative: "Positive",
                negative: "Negative",
                neutral: "Neutral",
              };
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    typeFilter === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-gray-400">
              {filtered.length} of {newsItems.length} shown
            </span>
          </div>
        </div>

        {/* ── States ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">Failed to load news. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No pending news to review</p>
            <p className="text-xs mt-1">All submissions have been processed</p>
          </div>
        )}

        {/* ── News list ── */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <NewsRow key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
