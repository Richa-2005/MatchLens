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

export default function Dashboard(themeProps: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobsResponse[]>([]);
  const [resumes, setResumes] = useState<ResumesResponse[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
      theme={themeProps.theme}
      toggleTheme={themeProps.toggleTheme}
    >
      {error && (
        <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Loading dashboard...
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/95 via-white to-sky-50/60 p-6 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Welcome back, {auth.user?.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Track your resume quality, compare roles, and improve your match over time.
            </p>
          </div>

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

          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard
              title="Latest Analysis"
              value={latestAnalysis ? `${latestAnalysis.overallScore}%` : "No data"}
              subtitle={
                latestAnalysis
                  ? new Date(latestAnalysis.createdAt).toLocaleDateString()
                  : ""
              }
            />

            <InsightCard
              title="Best Match"
              value={bestAnalysis ? `${bestAnalysis.overallScore}%` : "No data"}
              subtitle="Your highest scoring analysis"
            />

            <InsightCard
              title="Needs Improvement"
              value={worstAnalysis ? `${worstAnalysis.overallScore}%` : "No data"}
              subtitle="Focus here to improve"
            />
          </div>

          <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/60 p-5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
            <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Next Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <ActionBtn
                label="New Analysis"
                onClick={() => navigate("/new-analysis")}
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

          <div className="rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-100/70 p-6 text-center dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Analysis history and progress trends will appear here in future versions.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

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
          ? "border-violet-300/70 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/80 dark:border-violet-500/30 dark:from-violet-950/40 dark:via-slate-900 dark:to-indigo-950/30"
          : label === "Resumes"
          ? "border-sky-300/60 bg-gradient-to-br from-sky-50/95 via-white to-cyan-50/75 dark:border-sky-500/25 dark:from-sky-950/30 dark:via-slate-900 dark:to-cyan-950/20"
          : label === "Jobs"
          ? "border-emerald-300/60 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/75 dark:border-emerald-500/25 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20"
          : "border-amber-300/60 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/75 dark:border-amber-500/25 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20"
      }`}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          highlight
            ? "text-violet-700 dark:text-violet-300"
            : label === "Resumes"
            ? "text-sky-700 dark:text-sky-300"
            : label === "Jobs"
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-amber-700 dark:text-amber-300"
        }`}
      >
        {value}
      </p>
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
  const styles: Record<
    string,
    {
      border: string;
      bg: string;
      valueText: string;
    }
  > = {
    "Latest Analysis": {
      border: "border-cyan-300/60 dark:border-cyan-500/25",
      bg: "bg-gradient-to-br from-cyan-50/95 via-white to-sky-50/75 dark:from-cyan-950/30 dark:via-slate-900 dark:to-sky-950/20",
      valueText: "text-cyan-700 dark:text-cyan-300",
    },
    "Best Match": {
      border: "border-emerald-300/60 dark:border-emerald-500/25",
      bg: "bg-gradient-to-br from-emerald-50/95 via-white to-green-50/75 dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/20",
      valueText: "text-emerald-700 dark:text-emerald-300",
    },
    "Needs Improvement": {
      border: "border-amber-300/60 dark:border-amber-500/25",
      bg: "bg-gradient-to-br from-amber-50/95 via-white to-orange-50/75 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20",
      valueText: "text-amber-700 dark:text-amber-300",
    },
  };

  const current = styles[title] ?? {
    border: "border-slate-300/70 dark:border-slate-700",
    bg: "bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-100/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60",
    valueText: "text-slate-900 dark:text-slate-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${current.border} ${current.bg}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-2 text-lg font-semibold ${current.valueText}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
        {subtitle}
      </p>
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
      className="rounded-lg border border-indigo-200 bg-gradient-to-r from-white to-indigo-50/70 px-4 py-2 text-sm text-slate-700 hover:from-indigo-50 hover:to-indigo-100/80 dark:border-slate-600 dark:from-slate-900 dark:to-slate-800 dark:text-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700"
    >
      {label}
    </button>
  );
}