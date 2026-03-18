"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pill,
  AlertCircle,
  Loader2,
  Newspaper,
  BookOpen,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Pencil,
  X,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { callApi } from "@/global/func";
import { useUser } from "@/global/hook/useUser";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MedicineDescription {
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
  status: "active" | "warning" | "inactive" | "review" | "banned";
  description: MedicineDescription[];
  QNA: { question: string; answer: string; createdAt: string }[];
  newsCount?: number;
}

interface News {
  _id: string;
  status: "true" | "checking" | "false";
  newsType: "posative" | "negative" | "neutral";
  news: string;
  references: string;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const getMedicineById = async (id: string): Promise<Medicine> => {
  const response = await callApi(`/medicine/${id}`, "GET");
  if (response.error) throw new Error(response.message);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

const getNewsByMedicine = async (id: string): Promise<News[]> => {
  const response = await callApi(`/medicine/all-news/${id}`, "GET");
  if (response.error) throw new Error(response.message);
  return response.data;
};

const addNews = async (data: {
  medicinesRef: string;
  newsType: string;
  news: string;
  references: string;
}) => {
  const response = await callApi("/medicine/add-news", "POST", data);
  if (response.error) throw new Error(response.message);
  return response.data;
};

const updateNews = async ({
  id,
  data,
}: {
  id: string;
  data: { status?: string; newsType?: string; news?: string; references?: string };
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

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  review: "bg-blue-100 text-blue-700 border-blue-200",
  banned: "bg-red-50 text-red-700 border-red-200",
};

const NEWS_TYPE_ICON: Record<string, React.ReactNode> = {
  posative: <ThumbsUp className="h-4 w-4 text-emerald-600" />,
  negative: <ThumbsDown className="h-4 w-4 text-red-500" />,
  neutral: <Minus className="h-4 w-4 text-gray-400" />,
};

const NEWS_STATUS_ICON: Record<string, React.ReactNode> = {
  true: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
  checking: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  false: <XCircle className="h-3.5 w-3.5 text-red-500" />,
};

const NEWS_STATUS_LABEL: Record<string, string> = {
  true: "Verified",
  checking: "Pending review",
  false: "Rejected",
};

const TABS = ["Overview", "Clinical", "Special Populations", "News & Research", "Q&A"];

// ─── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: string }) {
  const lines = value.split("\n");

  const rendered = lines.map((line, i) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const rest = line.slice(colonIdx + 1).trim();
      return (
        <div key={i} className="mt-4">
          <p className="text-xs text-emerald-600 mb-1">
            {key}:
          </p>
          {rest && (
            <p className="text-sm text-gray-700 leading-relaxed">{rest}</p>
          )}
        </div>
      );
    }
    return (
      <p key={i} className="text-sm text-gray-700 leading-relaxed">
        {line || <>&nbsp;</>}
      </p>
    );
  });

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div>{rendered}</div>
    </div>
  );
}

// ─── Add News Modal ───────────────────────────────────────────────────────────

function AddNewsModal({ medicineId, onClose }: { medicineId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ newsType: "neutral", news: "", references: "" });

  const mutation = useMutation({
    mutationFn: () => addNews({ medicinesRef: medicineId, ...form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineNews", medicineId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add News / Research</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">News Type</label>
            <div className="flex gap-2">
              {(["posative", "negative", "neutral"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, newsType: t }))}
                  className={`flex-1 py-2 text-sm rounded-lg border capitalize font-medium transition-colors ${form.newsType === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">News Content</label>
            <textarea rows={4} value={form.news} onChange={(e) => setForm((p) => ({ ...p, news: e.target.value }))}
              placeholder="Describe the news or research finding..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">References</label>
            <input type="text" value={form.references} onChange={(e) => setForm((p) => ({ ...p, references: e.target.value }))}
              placeholder="DOI, URL, or citation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        {mutation.error && <p className="text-xs text-red-600 mt-2">{(mutation.error as Error).message}</p>}
        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" disabled={mutation.isPending || !form.news || !form.references} onClick={() => mutation.mutate()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {mutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit News Modal (sudo / admin only) ─────────────────────────────────────

function EditNewsModal({ item, medicineId, onClose }: { item: News; medicineId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    newsType: item.newsType,
    news: item.news,
    references: item.references,
    status: item.status,
  });

  const mutation = useMutation({
    mutationFn: () => updateNews({ id: item._id, data: form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineNews", medicineId] });
      onClose();
    },
  });

  const verificationOptions = [
    { val: "true" as const, label: "Verified", activeCls: "bg-emerald-600 text-white border-emerald-600" },
    { val: "checking" as const, label: "Pending", activeCls: "bg-amber-500 text-white border-amber-500" },
    { val: "false" as const, label: "Rejected", activeCls: "bg-red-600 text-white border-red-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit News</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* News Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">News Type</label>
            <div className="flex gap-2">
              {(["posative", "negative", "neutral"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, newsType: t }))}
                  className={`flex-1 py-2 text-sm rounded-lg border capitalize font-medium transition-colors ${form.newsType === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
              <span className="ml-1.5 text-xs text-blue-600 font-normal">(admin control)</span>
            </label>
            <div className="flex gap-2">
              {verificationOptions.map(({ val, label, activeCls }) => (
                <button key={val} type="button" onClick={() => setForm((p) => ({ ...p, status: val }))}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${form.status === val ? activeCls : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">News Content</label>
            <textarea rows={4} value={form.news} onChange={(e) => setForm((p) => ({ ...p, news: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* References */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">References</label>
            <input type="text" value={form.references} onChange={(e) => setForm((p) => ({ ...p, references: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {mutation.error && <p className="text-xs text-red-600 mt-2">{(mutation.error as Error).message}</p>}

        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" disabled={mutation.isPending || !form.news || !form.references} onClick={() => mutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ item, medicineId, canEdit }: { item: News; medicineId: string; canEdit: boolean }) {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteNews(item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineNews", medicineId] });
      setConfirmDelete(false);
    },
  });

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{NEWS_TYPE_ICON[item.newsType]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 leading-relaxed">{item.news}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                {NEWS_STATUS_ICON[item.status]}
                <span className="text-xs text-gray-400">{NEWS_STATUS_LABEL[item.status]}</span>
              </div>
              <span className="text-gray-300 hidden sm:block">·</span>
              <a href={item.references} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-xs">
                <ExternalLink className="h-3 w-3 shrink-0" />
                {item.references}
              </a>
            </div>

            {/* Inline delete confirmation */}
            {confirmDelete && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-xs text-red-700 flex-1">Delete this news entry?</span>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowEdit(true)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit news">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete news">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {showEdit && <EditNewsModal item={item} medicineId={medicineId} onClose={() => setShowEdit(false)} />}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState("Overview");
  const [langTab, setLangTab] = useState<"english" | "bangla">("english");
  const [showAddNews, setShowAddNews] = useState(false);
  const [expandedQna, setExpandedQna] = useState<number | null>(null);

  const canEditNews = user?.role === "sudo" || user?.role === "admin";

  const { data: medicine, isLoading, error } = useQuery({
    queryKey: ["medicine", id],
    queryFn: () => getMedicineById(id),
    enabled: !!id,
  });

  const { data: newsItems = [], isLoading: newsLoading } = useQuery({
    queryKey: ["medicineNews", id],
    queryFn: () => getNewsByMedicine(id),
    enabled: !!id && activeTab === "News & Research",
  });

  const desc = medicine?.description.find((d) => d.language === langTab) || medicine?.description[0];

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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Medicine Not Found</h2>
          <button onClick={() => router.back()} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Medicines
            </button>
            {canEditNews && (
              <button onClick={() => router.push(`/medicines/${id}/edit`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4" /> Edit Medicine
              </button>
            )}
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Pill className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">{medicine.genericName}</h1>
                  <span className={`px-2.5 py-0.5 text-xs font-medium border rounded-full capitalize ${STATUS_BADGE[medicine.status]}`}>
                    {medicine.status}
                  </span>
                  {medicine.requiresPrescription ? (
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full">Rx | Prescription Only</span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">OTC</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicine.availableForms.map((form) => (
                    <span key={form} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md capitalize">{form}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Language switcher */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              {(["english", "bangla"] as const).map((l) => (
                <button key={l} onClick={() => setLangTab(l)}
                  className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${langTab === l ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-gray-200 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {tab}
                {tab === "News & Research" && medicine.newsCount !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{medicine.newsCount}</span>
                )}
                {tab === "Q&A" && medicine.QNA?.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{medicine.QNA.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "Overview" && desc && (
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard label="Indications" value={desc.indications} />
            <InfoCard label="Side Effects" value={desc.sideEffects} />
            <InfoCard label="Dosage" value={desc.dosage} />
            <InfoCard label="Storage Conditions" value={desc.storageConditions} />
            <div className="md:col-span-2">
              <InfoCard label="Chemical Structure" value={desc.chemicalStructure} />
            </div>
          </div>
        )}

        {activeTab === "Clinical" && desc && (
          <div className="grid gap-4">
            <InfoCard label="Precautions & Warnings" value={desc.precautionsAndWarnings} />
            <InfoCard label="Overdose Effects" value={desc.overdoseEffects} />
          </div>
        )}

        {activeTab === "Special Populations" && desc && (
          <div className="grid md:grid-cols-2 gap-4">
            {desc.useInSpecialPopulations.map((pop, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-800">{pop.title}</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{pop.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "News & Research" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">News & Research</h2>
                {canEditNews && (
                  <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                    <Pencil className="h-3 w-3" /> You can edit and verify news as admin
                  </p>
                )}
              </div>
              <button onClick={() => setShowAddNews(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-4 w-4" /> Add News
              </button>
            </div>

            {newsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}

            {!newsLoading && newsItems.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No news or research articles yet</p>
              </div>
            )}

            <div className="space-y-3">
              {newsItems.map((item) => (
                <NewsCard key={item._id} item={item} medicineId={id} canEdit={canEditNews} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "Q&A" && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Questions & Answers</h2>
            {medicine.QNA?.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No Q&A entries yet</p>
              </div>
            )}
            <div className="space-y-2">
              {medicine.QNA?.map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedQna(expandedQna === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-medium text-gray-800 pr-4">{item.question}</span>
                    {expandedQna === i ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                  </button>
                  {expandedQna === i && (
                    <div className="px-5 pb-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddNews && <AddNewsModal medicineId={id} onClose={() => setShowAddNews(false)} />}
    </div>
  );
}