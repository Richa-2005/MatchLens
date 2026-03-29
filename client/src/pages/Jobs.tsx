import { useState, useEffect } from "react";
import api from "@/api/axiosClient";
import AppShell from "@/components/AppShell";
import JobModal from "./modals/JobModal";
import JobCard from "./modals/JobCard";
import JobEditor from "@/components/forms/JobEditor";
import toast from "react-hot-toast";

type JobsResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type JobResponse = JobsResponse & {
  rawText: string;
};

type SortingVal = "Newest" | "Oldest";

type AnalysisInput = {
  title: string;
  rawText: string;
};

export default function Jobs(themeProps: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const [jobs, setJobs] = useState<JobsResponse[]>([]);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortingVal>("Newest");

  const [newJob, setNewJob] = useState<AnalysisInput>({ title: "", rawText: "" });
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const filterJobs = (items: JobsResponse[], searchValue: string) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const sortJobs = (items: JobsResponse[], sortValue: SortingVal) => {
    const sorted = [...items];

    sorted.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sortValue === "Newest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  };

  const fetchJobs = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (error) {
      setError("Failed to load jobs descriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openJob = async (id: string) => {
    setError("");
    setLoading(true);

    try {
      const job = await api.get(`/jobs/${id}`);
      setJob(job.data);
    } catch (error) {
      toast.error("Failed to fetch this job.");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
  setError("");
  setLoading(true);

  try {
    await api.delete(`/jobs/${id}`);
    setJob(null);
    toast.success("Job deleted successfully.");
    await fetchJobs();
  } catch (error: any) {
    console.log(error?.response?.status);
    console.log(error?.response?.data);
    setError(error?.response?.data?.error || "Failed to delete this job.");
    toast.error(error?.response?.data?.error || "Failed to delete this job.");
  } finally {
    setLoading(false);
  }
};

  const updateJob = async (id: string, data: AnalysisInput) => {
  try {
    await api.put(`/jobs/${id}`, data);
    toast.success("Job updated successfully.");

    const updatedJob = await api.get(`/jobs/${id}`);
    setJob(updatedJob.data);

    await fetchJobs();
  } catch (error) {
    toast.error("Failed to update job.");
  }
};

  const displayedJobs = sortJobs(filterJobs(jobs, search), sort);

  const saveJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (
        newJob.title.trim().length === 0 ||
        newJob.rawText.trim().length === 0
      ) {
        setError("Please fill all fields for Job.");
        setSubmitting(false);
        return;
      }

      await api.post("/jobs", newJob);
toast.success("Job saved successfully.");
setNewJob({ title: "", rawText: "" });
      await fetchJobs();
    } catch (error) {
      toast.error("Failed to save job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell 
      title="Jobs" 
      subtitle="Manage and edit your saved job descriptions"
      theme={themeProps.theme}
      toggleTheme={themeProps.toggleTheme}
    >
      {!job && (
        <JobEditor
          badge="Job Library"
          titleText="Create New Job"
          description="Save a job description now and reuse it later for analysis."
          submitLabel="Save Job"
          submittingLabel="Saving..."
          title={newJob.title}
          rawText={newJob.rawText}
          setFormData={setNewJob}
          onSubmit={saveJob}
          isSubmitting={isSubmitting}
        />
      )}

      {error && (
  <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
    {error}
  </div>
)}

      {loading && <div className="text-sm text-slate-600 dark:text-slate-400">Loading...</div>}

      {!loading && job && (
        <JobModal
          setJob={setJob}
          deleteJob={deleteJob}
          updateJob={updateJob}
          job={job}
          loading={loading}
        />
      )}

      {!loading && !job && (
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

{displayedJobs.length === 0 && (
  <div className="rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/35 px-6 py-12 text-center dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
    <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
      No jobs found
    </p>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
      Create your first saved job description to get started.
    </p>
  </div>

          )}

          <JobCard displayedJobs={displayedJobs} openJob={openJob} />
        </div>
      )}
    </AppShell>
  );
}