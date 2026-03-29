import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import AnalysisResultView from "./modals/AnalysisResultView";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import  toast  from "react-hot-toast";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type AnalysisListItem = {
  id: string;
  overallScore: number;
  probabilityScore: number;
  createdAt: string;
  resumeId: string;
  jobDescriptionId: string;
  resume: {
    title: string;
  };
  jobDescription: {
    title: string;
  };
};

type AnalyzeResult = {
  id: string;
  overallScore: number;
  probabilityScore: number;
  skills: {
    matched: string[];
    related: string[];
    missing: string[];
    highImpactMissing: string[];
  };
  signals: {
    skillOverlap: number;
    keywordOverlap: number;
    tfidfSimilarity: number;
    impactScore: number;
    relatedSkillBonus: number;
  };
  insights: {
    strengths: string[];
    issues: string[];
    tips: string[];
  };
  explanation: string[];
  createdAt: string;
  resumeId: string | null;
  jobDescriptionId: string | null;
};

export default function AnalysisHistory(themeProps: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>("");

  const [savedResumes, setSavedResumes] = useState<{ id: string; title: string }[]>([]);
  const [savedJobs, setSavedJobs] = useState<{ id: string; title: string }[]>([]);

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const [analysisList, setAnalysisList] = useState<AnalysisListItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalyzeResult | null>(null);

  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoadingFilters(true);

        const [resumesRes, jobsRes] = await Promise.all([
          api.get("/resumes"),
          api.get("/jobs"),
        ]);

        setSavedResumes(resumesRes.data);
        setSavedJobs(jobsRes.data);
      } catch (error) {
        setError("Failed to load saved resumes and jobs.");
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchSavedItems();
  }, []);

  useEffect(() => {
    const fetchAnalysisList = async () => {
      try {
        setLoadingList(true);
        setError("");
        setSelectedAnalysis(null);

        const params: Record<string, string> = {};

        if (selectedResumeId) params.resumeId = selectedResumeId;
        if (selectedJobId) params.jobId = selectedJobId;
        if (search.trim()) params.search = search.trim();

        const response = await api.get("/analysis", { params });
        setAnalysisList(response.data);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.error ||
            "Failed to load analysis history. Please try again later."
        );
      } finally {
        setLoadingList(false);
      }
    };

    fetchAnalysisList();
  }, [selectedResumeId, selectedJobId, search]);

  const openAnalysis = async (id: string) => {
    try {
      setLoadingDetail(true);
      setError("");

      const response = await api.get(`/analysis/${id}`);
      setSelectedAnalysis(response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to load analysis details. Please try again later."
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedResumeId("");
    setSelectedJobId("");
  };

  if (selectedAnalysis) {
    return (
      <AppShell
        title="Analysis History"
        subtitle="Review saved resume-job match and detailed ATS insights."
        theme={themeProps.theme}
        toggleTheme={themeProps.toggleTheme}
      >
        <div className="space-y-6">
          <button
            onClick={() => setSelectedAnalysis(null)}
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            ← Back to analysis history
          </button>

          {error && (
            <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          {loadingDetail ? (
            <Card className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
              <CardContent className="py-10 text-sm text-slate-600 dark:text-slate-400">
                Loading analysis details...
              </CardContent>
            </Card>
          ) : (
            <AnalysisResultView analyzeResult={selectedAnalysis} />
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analysis History"
      subtitle="Search, filter, and review your previous resume-job analyses."
      theme={themeProps.theme}
      toggleTheme={themeProps.toggleTheme}
    >
      <div className="space-y-6">
        <Card className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-300/60 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-sky-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Filter Saved Analyses
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Search by title or filter by saved resume and job to find previous analyses.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 bg-white/40 dark:bg-slate-900/30">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by resume title or job title..."
                className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
              />

              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All resumes</option>
                {savedResumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All jobs</option>
                {savedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="border-slate-300 bg-white/90 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                Clear
              </Button>
            </div>

            {(selectedResumeId || selectedJobId || search.trim()) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {search.trim() && (
                  <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Search: {search}
                  </span>
                )}
                {selectedResumeId && (
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-100/70 px-3 py-1 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    Resume selected
                  </span>
                )}
                {selectedJobId && (
                  <span className="rounded-full border border-violet-500/20 bg-violet-100/70 px-3 py-1 text-xs text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                    Job selected
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {(loadingFilters || loadingList) && (
          <Card className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
            <CardContent className="py-10 text-sm text-slate-600 dark:text-slate-400">
              Loading analysis history...
            </CardContent>
          </Card>
        )}

        {!loadingList && analysisList.length === 0 && (
          <Card className="border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/35 shadow-xl shadow-slate-200/30 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 dark:shadow-black/10">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                📄
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No analysis found
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                No saved analysis matches the selected filters. Try changing the filters
                or run a new analysis first.
              </p>
              <Button
                type="button"
                className="mt-5 bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={() => navigate("/new-analysis")}
              >
                Go to New Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {!loadingList && analysisList.length > 0 && (
          <div className="grid gap-4">
            {analysisList.map((analysis) => (
              <Card
                key={analysis.id}
                className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/30 shadow-lg shadow-slate-200/30 transition hover:border-indigo-400/40 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60 dark:shadow-black/10 dark:hover:border-indigo-500/30"
              >
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full border border-indigo-500/20 bg-indigo-100/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {analysis.overallScore >= 80
                          ? "Strong Match"
                          : analysis.overallScore >= 65
                          ? "Strong Potential"
                          : analysis.overallScore >= 45
                          ? "Average Match"
                          : "Low Match"}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(analysis.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {analysis.resume.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Compared with{" "}
                        <span className="text-slate-800 dark:text-slate-300">
                          {analysis.jobDescription.title}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-2xl border border-slate-300/70 bg-white/75 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/80">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Score
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {analysis.overallScore}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-300/70 bg-white/75 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/80">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Probability
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {(analysis.probabilityScore * 100).toFixed(1)}%
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => openAnalysis(analysis.id)}
                      className="bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}