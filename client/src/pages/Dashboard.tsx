import AppShell from "@/components/AppShell";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type JobsResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type ResumesResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type AnalysisResponse = {
  id: string;
  overallScore: number;
  probabilityScore: number;
  createdAt: string;
};

export default function Dashboard() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobsResponse[]>([]);
  const [resumes, setResumes] = useState<ResumesResponse[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // SINGLE FETCH
  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [resRes, jobRes, anaRes] = await Promise.all([
        api.get("/resumes"),
        api.get("/jobs"),
        api.get("/analysis/all"),
      ]);

      setResumes(resRes.data);
      setJobs(jobRes.data);
      setAnalysis(anaRes.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // DERIVED DATA
  const latestAnalysis = [...analysis].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const bestAnalysis = [...analysis].sort(
    (a, b) => b.overallScore - a.overallScore
  )[0];

  const worstAnalysis = [...analysis].sort(
    (a, b) => a.overallScore - b.overallScore
  )[0];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of your progress and activity"
    >
      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-slate-400">Loading dashboard...</div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* HEADER */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
            <h2 className="text-lg font-semibold text-slate-100">
              Welcome back, {auth.user?.name}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Track your resume quality, compare roles, and improve your match over time.
            </p>
          </div>

          {/* STATS */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Resumes" value={resumes.length} />
            <StatCard label="Jobs" value={jobs.length} />
            <StatCard label="Analyses" value={analysis.length} />
            <StatCard
              label="Best Score"
              value={bestAnalysis ? `${bestAnalysis.overallScore}%` : "--"}
              highlight
            />
          </div>

          {/* INSIGHTS */}
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard
              title="Latest Analysis"
              value={
                latestAnalysis
                  ? `${latestAnalysis.overallScore}%`
                  : "No data"
              }
              subtitle={
                latestAnalysis
                  ? new Date(latestAnalysis.createdAt).toLocaleDateString()
                  : ""
              }
            />

            <InsightCard
              title="Best Match"
              value={
                bestAnalysis ? `${bestAnalysis.overallScore}%` : "No data"
              }
              subtitle="Your highest scoring analysis"
            />

            <InsightCard
              title="Needs Improvement"
              value={
                worstAnalysis ? `${worstAnalysis.overallScore}%` : "No data"
              }
              subtitle="Focus here to improve"
            />
          </div>

          {/* ACTIONS */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Next Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <ActionBtn
                label="New Analysis"
                onClick={() => navigate("/analysis")}
              />
              <ActionBtn
                label="View Resumes"
                onClick={() => navigate("/resumes")}
              />
              <ActionBtn
                label="View Jobs"
                onClick={() => navigate("/jobs")}
              />
            </div>
          </div>

          {/* FUTURE */}
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center">
            <p className="text-sm text-slate-400">
              Analysis history and progress trends will appear here in future versions.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-indigo-500/40 bg-indigo-500/10"
          : "border-slate-700 bg-slate-800/60"
      }`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
    >
      {label}
    </button>
  );
}