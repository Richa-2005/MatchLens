import { useState, useEffect } from "react";
import api from "@/api/axiosClient";
import AppShell from "@/components/AppShell";
import JobModal from "./modals/JobModal";
import JobCard from "./modals/JobCard";
import JobEditor from "@/components/forms/JobEditor";

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

export default function Jobs() {
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
      setError("Failed to load your jobs. Please try again later.");
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
      setError("Failed to fetch this job.");
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
      await fetchJobs();
    } catch (error) {
      setError("Failed to delete this job.");
    } finally {
      setLoading(false);
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
      setNewJob({ title: "", rawText: "" });
      await fetchJobs();
    } catch (error) {
      setError("Failed to save. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Jobs" subtitle="Manage and edit your saved job descriptions">
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
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-slate-400">Loading...</div>}

      {!loading && job && (
        <JobModal setJob={setJob} deleteJob={deleteJob} job={job} />
      )}

      {!loading && !job && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by title..."
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
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
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center">
              <p className="text-sm text-slate-400">
                No jobs yet. Create your first one.
              </p>
            </div>
          )}

          <JobCard displayedJobs={displayedJobs} openJob={openJob} />
        </div>
      )}
    </AppShell>
  );
}