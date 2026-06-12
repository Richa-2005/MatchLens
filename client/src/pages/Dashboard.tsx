import AppShell from "@/components/AppShell";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import type { AnalysisListItem, HistoryInsights } from "@/types/analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type ResumeRecommendation = {
  resumeId: string;
  resumeTitle: string;
  jobId: string;
  jobTitle: string;
  overallScore: number;
  probabilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  highImpactMissing: string[];
  summary?: unknown;
  recommendation: string;
};

type ApplicationStatus =
  | "PLANNED"
  | "APPLIED"
  | "INTERVIEW"
  | "REJECTED"
  | "OFFER"
  | "WITHDRAWN";

type ApplicationItem = {
  id: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  source: string | null;
  notes: string | null;
  resume: { title: string };
  jobDescription: { title: string };
  createdAt: string;
  updatedAt: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const applicationStatuses: ApplicationStatus[] = [
  "PLANNED",
  "APPLIED",
  "INTERVIEW",
  "REJECTED",
  "OFFER",
  "WITHDRAWN",
];

export default function Dashboard(themeProps: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobsResponse[]>([]);
  const [resumes, setResumes] = useState<ResumesResponse[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisListItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [historyInsights, setHistoryInsights] = useState<HistoryInsights | null>(null);
  const [selectedStrategyJobId, setSelectedStrategyJobId] = useState<string>("");
  const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string>("");
  const [recommendations, setRecommendations] = useState<ResumeRecommendation[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState<boolean>(false);
  const [
    creatingApplicationForResumeId,
    setCreatingApplicationForResumeId,
  ] = useState<string | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    string | null
  >(null);
  const [deletingApplicationId, setDeletingApplicationId] = useState<
    string | null
  >(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [resRes, jobRes, anaRes, historyRes, applicationsRes] = await Promise.all([
        api.get("/resumes"),
        api.get("/jobs"),
        api.get("/analysis/all"),
        api.get("/analysis/insights/history"),
        api.get<ApplicationItem[]>("/applications"),
      ]);

      setHistoryInsights(historyRes.data);

      setResumes(resRes.data);
      setJobs(jobRes.data);
      setAnalysis(anaRes.data);
      setApplications(applicationsRes.data);
    } catch {
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

  const bestRecommendation = recommendations[0] ?? null;
  const applicationCounts = applicationStatuses.reduce<
    Record<ApplicationStatus, number>
  >(
    (counts, status) => {
      counts[status] = applications.filter(
        (application) => application.status === status
      ).length;
      return counts;
    },
    {
      PLANNED: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      REJECTED: 0,
      OFFER: 0,
      WITHDRAWN: 0,
    }
  );
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const handleStrategyJobChange = async (jobId: string) => {
    setSelectedStrategyJobId(jobId);
    setStrategyError("");
    setRecommendations([]);
    setShowAllRecommendations(false);

    if (!jobId) return;

    setStrategyLoading(true);

    try {
      const response = await api.post<ResumeRecommendation[]>(
        "/analysis/recommend-resume",
        { jobId }
      );
      setRecommendations(response.data);
    } catch {
      setStrategyError("Failed to recommend resumes for this job.");
    } finally {
      setStrategyLoading(false);
    }
  };

  const createApplicationFromRecommendation = async (
    recommendation: ResumeRecommendation
  ) => {
    setCreatingApplicationForResumeId(recommendation.resumeId);

    try {
      await api.post("/applications", {
        jobDescriptionId: recommendation.jobId,
        resumeId: recommendation.resumeId,
        status: "PLANNED",
      });

      toast.success("Application added to tracker.");
      await loadDashboard();
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      toast.error(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Failed to add application to tracker."
      );
    } finally {
      setCreatingApplicationForResumeId(null);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    setUpdatingApplicationId(applicationId);

    try {
      await api.put(`/applications/${applicationId}`, { status });
      toast.success("Application status updated.");
      await loadDashboard();
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      toast.error(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Failed to update application status."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const deleteTrackedApplication = async (application: ApplicationItem) => {
    const confirmed = window.confirm(
      `Remove the application for ${application.jobDescription.title} from the tracker?`
    );

    if (!confirmed) return;

    setDeletingApplicationId(application.id);

    try {
      await api.delete(`/applications/${application.id}`);
      toast.success("Application removed from tracker.");
      await loadDashboard();
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      toast.error(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Failed to remove application from tracker."
      );
    } finally {
      setDeletingApplicationId(null);
    }
  };

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

          <div className="grid gap-4 md:grid-cols-5">
            <StatCard label="Resumes" value={resumes.length} />
            <StatCard label="Jobs" value={jobs.length} />
            <StatCard label="Analyses" value={analysis.length} />
            <StatCard
              label="Total Analyses"
              value={historyInsights ? historyInsights.totalAnalyses : "--"}
            />
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

          {historyInsights && (
            <div className="rounded-2xl border border-indigo-300/70 bg-indigo-50/70 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                History Intelligence
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Total: {historyInsights.totalAnalyses}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Avg Score: {historyInsights.averageScore}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Best: {historyInsights.bestScore}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Worst: {historyInsights.worstScore}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Trend: {historyInsights.trend}
                </p>
              </div>

              {historyInsights.repeatedMissingSkills.length > 0 && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Repeated gaps: {historyInsights.repeatedMissingSkills.join(", ")}
                </p>
              )}

              {historyInsights.commonWeakSignals.length > 0 && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Common weak signals: {historyInsights.commonWeakSignals.join(", ")}
                </p>
              )}
            </div>
          )}

          <Card className="rounded-xl border-border bg-card">
            <CardHeader>
              <CardTitle>Resume Strategy</CardTitle>
              <CardDescription>
                Find the best resume for a selected job description.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <label
                    htmlFor="resume-strategy-job"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Job Description
                  </label>
                  <select
                    id="resume-strategy-job"
                    value={selectedStrategyJobId}
                    onChange={(event) => {
                      void handleStrategyJobChange(event.target.value);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-indigo-400 dark:bg-slate-900"
                  >
                    <option value="">Select a job description</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={recommendations.length === 0}
                  onClick={() => setShowAllRecommendations((current) => !current)}
                >
                  Compare All Resumes
                </Button>
              </div>

              {strategyError && (
                <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  {strategyError}
                </div>
              )}

              {strategyLoading && <ResumeStrategySkeleton />}

              {!strategyLoading && bestRecommendation && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Best Resume</p>
                    <h3 className="mt-2 text-lg font-semibold text-card-foreground">
                      {bestRecommendation.resumeTitle}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {bestRecommendation.recommendation}
                    </p>
                    <Button
                      type="button"
                      className="mt-4"
                      disabled={
                        creatingApplicationForResumeId ===
                        bestRecommendation.resumeId
                      }
                      onClick={() => {
                        void createApplicationFromRecommendation(
                          bestRecommendation
                        );
                      }}
                    >
                      {creatingApplicationForResumeId ===
                      bestRecommendation.resumeId
                        ? "Adding..."
                        : "Use This Resume"}
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {bestRecommendation.overallScore}%
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Probability {(bestRecommendation.probabilityScore * 100).toFixed(1)}%
                    </p>
                  </div>

                  <SkillBadgeGroup
                    title="Top Matched Skills"
                    skills={bestRecommendation.matchedSkills.slice(0, 5)}
                  />

                  <SkillBadgeGroup
                    title="Missing Skills"
                    skills={bestRecommendation.missingSkills.slice(0, 5)}
                    variant="outline"
                  />
                </div>
              )}

              {!strategyLoading && selectedStrategyJobId && recommendations.length === 0 && !strategyError && (
                <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  No eligible resumes were returned for this job.
                </p>
              )}

              {showAllRecommendations && recommendations.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="grid gap-0 divide-y divide-border">
                    {recommendations.map((item, index) => (
                      <div
                        key={item.resumeId}
                        className="grid gap-3 bg-card p-4 md:grid-cols-[minmax(0,1fr)_100px_minmax(0,1.5fr)_auto] md:items-center"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">#{index + 1}</p>
                          <p className="font-medium text-card-foreground">
                            {item.resumeTitle}
                          </p>
                        </div>

                        <p className="text-lg font-semibold text-card-foreground">
                          {item.overallScore}%
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {item.matchedSkills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {item.matchedSkills.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                              No matched skills
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            creatingApplicationForResumeId === item.resumeId
                          }
                          onClick={() => {
                            void createApplicationFromRecommendation(item);
                          }}
                        >
                          {creatingApplicationForResumeId === item.resumeId
                            ? "Adding..."
                            : "Use This Resume"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border bg-card">
            <CardHeader>
              <CardTitle>Application Tracker</CardTitle>
              <CardDescription>
                Track the current status of your recent job applications.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {applicationStatuses.map((status) => (
                  <div
                    key={status}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatApplicationStatus(status)}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-card-foreground">
                      {applicationCounts[status]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-card-foreground">
                  Recent Applications
                </h3>

                {recentApplications.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                    No applications tracked yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="divide-y divide-border">
                      {recentApplications.map((application) => (
                        <div
                          key={application.id}
                          className="grid gap-3 bg-card p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-card-foreground">
                              {application.jobDescription.title}
                            </p>
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              Resume: {application.resume.title}
                            </p>
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            {application.appliedAt && (
                              <p>
                                Applied{" "}
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </p>
                            )}
                            {application.source && (
                              <p className="truncate">
                                Source: {application.source}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Status for ${application.jobDescription.title}`}
                              value={application.status}
                              disabled={
                                updatingApplicationId === application.id ||
                                deletingApplicationId === application.id
                              }
                              onChange={(event) => {
                                void updateApplicationStatus(
                                  application.id,
                                  event.target.value as ApplicationStatus
                                );
                              }}
                              className={`min-w-32 rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${applicationStatusClassName(
                                application.status
                              )}`}
                            >
                              {applicationStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {formatApplicationStatus(status)}
                                </option>
                              ))}
                            </select>

                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              title="Remove application"
                              aria-label={`Remove application for ${application.jobDescription.title}`}
                              disabled={
                                deletingApplicationId === application.id ||
                                updatingApplicationId === application.id
                              }
                              onClick={() => {
                                void deleteTrackedApplication(application);
                              }}
                              className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function formatApplicationStatus(status: ApplicationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function applicationStatusClassName(status: ApplicationStatus) {
  const styles: Record<ApplicationStatus, string> = {
    PLANNED:
      "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
    APPLIED:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300",
    INTERVIEW:
      "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300",
    REJECTED:
      "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
    OFFER:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    WITHDRAWN:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return styles[status];
}

function SkillBadgeGroup({
  title,
  skills,
  variant = "secondary",
}: {
  title: string;
  skills: string[];
  variant?: "secondary" | "outline";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <span className="text-sm text-muted-foreground">None</span>
        ) : (
          skills.map((skill) => (
            <Badge key={skill} variant={variant}>
              {skill}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

function ResumeStrategySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-xl border border-border bg-muted/50"
        />
      ))}
    </div>
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
