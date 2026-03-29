import { useState, useEffect } from "react";
import api from "@/api/axiosClient";
import AppShell from "@/components/AppShell";
import ResumeModal from "./modals/ResumeModal";
import ResumeCard from "./modals/ResumeCard";
import ResumeEditor from "@/components/forms/ResumeEditor";
import toast from "react-hot-toast";

type ResumesResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type ResumeResponse = ResumesResponse & {
  rawText: string;
};

type SortingVal = "Newest" | "Oldest";

type AnalysisInput = {
  title: string;
  rawText: string;
};

export default function Resume(themeProps: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const [resumes, setResumes] = useState<ResumesResponse[]>([]);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortingVal>("Newest");

  const [newResume, setNewResume] = useState<AnalysisInput>({
    title: "",
    rawText: "",
  });
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filterResumes = (items: ResumesResponse[], searchValue: string) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const sortResumes = (items: ResumesResponse[], sortValue: SortingVal) => {
    const sorted = [...items];

    sorted.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sortValue === "Newest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  };

  const fetchResumes = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.get("/resumes");
      setResumes(response.data);
    } catch (error) {
      setError("Failed to load your resumes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openResume = async (id: string) => {
    setError("");
    setLoading(true);

    try {
      const resume = await api.get(`/resumes/${id}`);
      setResume(resume.data);
    } catch (error) {
      toast.error("Failed to fetch this resume. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
const deleteResume = async (id: string) => {
  setError("");
  setLoading(true);

  try {
    await api.delete(`/resumes/${id}`);
    setResume(null);
    toast.success("Resume deleted successfully.");
    await fetchResumes();
  } catch (error: any) {
    console.log(error?.response?.status);
    console.log(error?.response?.data);
    setError(error?.response?.data?.error || "Failed to delete this resume.");
    toast.error(error?.response?.data?.error || "Failed to delete this resume.");
  } finally {
    setLoading(false);
  }
};
  const updateResume = async (id: string, data: AnalysisInput) => {
  try {
    await api.put(`/resumes/${id}`, data);
    toast.success("Resume updated successfully.");

    const updatedResume = await api.get(`/resumes/${id}`);
    setResume(updatedResume.data);

    await fetchResumes();
  } catch (error) {
    toast.error("Failed to update resume.");
  }
};

  const displayedResumes = sortResumes(filterResumes(resumes, search), sort);

  const handleModeChange = (nextMode: "manual" | "upload") => {
    setMode(nextMode);
    setError("");

    if (nextMode === "manual") {
      setSelectedFile(null);
    } else {
      setNewResume((prev) => ({ ...prev, rawText: "" }));
    }
  };

  const saveResume = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode == "manual") {
        if (
          newResume.title.trim().length === 0 ||
          newResume.rawText.trim().length === 0
        ) {
          toast.error("Please fill out both the title and content of the resume.");
          setSubmitting(false);
          return;
        }
        await api.post("/resumes", newResume);
        toast.success("Resume saved successfully.");
        setNewResume({ title: "", rawText: "" });
      } else {
        if (selectedFile == null) {
          toast.error("Please select a PDF file to upload.");
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append(
          "title",
          newResume.title.trim() || selectedFile.name.replace(".pdf", "")
        );

        await api.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Resume uploaded successfully.");
      setSelectedFile(null);
      setNewResume({ title: "", rawText: "" });
      }
      await fetchResumes();
    } catch (error) {
      toast.error("Failed to save resume. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Resumes"
      subtitle="Manage and edit your saved resumes"
      theme={themeProps.theme}
      toggleTheme={themeProps.toggleTheme}
    >
      {!resume && (
        <ResumeEditor
          badge="Resume Library"
          titleText="Create New Resume"
          description="Save a resume now and reuse it later for analysis."
          submitLabel="Save Resume"
          submittingLabel="Saving..."
          title={newResume.title}
          rawText={newResume.rawText}
          setFormData={setNewResume}
          onSubmit={saveResume}
          isSubmitting={isSubmitting}
          mode={mode}
          setMode={handleModeChange}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
          onDropFile={setSelectedFile}
          layout="card"
        />
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      )}

      {!loading && resume && 
        <ResumeModal 
          setResume={setResume} 
          deleteResume={deleteResume}
          updateResume={updateResume}
          resume={resume}
          loading={loading}
        />
      }

      {!loading && !resume && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-300/70 bg-gradient-to-r from-slate-50/95 via-white/90 to-indigo-50/35 p-3 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
            <input
              type="text"
              placeholder="Search by title..."
              className="min-w-[240px] rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              onChange={(e) => {
                const val: unknown = e.target.value;
                const value = val as SortingVal;
                setSort(value);
              }}
              value={sort}
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>

          {displayedResumes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/35 px-6 py-12 text-center dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                No resumes found
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                Create one manually or upload a PDF to get started.
              </p>
            </div>
          )}

          <ResumeCard displayedResumes={displayedResumes} openResume={openResume} />
        </div>
      )}
    </AppShell>
  );
}