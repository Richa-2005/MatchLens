import { useState, useEffect } from "react";
import api from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/AppShell";
import ResumeEditor from "@/components/forms/ResumeEditor";
import AnalysisResultView from "./modals/AnalysisResultView";
import  toast  from "react-hot-toast";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type AnalysisInput = {
  title: string;
  rawText: string;
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

export default function NewAnalysis(themeProps: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const [resume, setResume] = useState<AnalysisInput>({ title: "", rawText: "" });
  const [job, setJob] = useState<AnalysisInput>({ title: "", rawText: "" });

  const [saving, setSaving] = useState<boolean>(false);
  const [analyzing, setAnalyze] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [resumeMode, setResumeMode] = useState<"manual" | "upload">("manual");
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);

  const [savedResumes, setSavedResumes] = useState<{ id: string; title: string }[]>([]);
  const [savedJobs, setSavedJobs] = useState<{ id: string; title: string }[]>([]);

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (!analyzing) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(1);

    const timers = [
      setTimeout(() => setCurrentStep(2), 700),
      setTimeout(() => setCurrentStep(3), 1400),
      setTimeout(() => setCurrentStep(4), 2100),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [analyzing]);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoadingSaved(true);

        const [resumesRes, jobsRes] = await Promise.all([
          api.get("/resumes"),
          api.get("/jobs"),
        ]);

        setSavedResumes(resumesRes.data);
        setSavedJobs(jobsRes.data);
      } catch (err) {
        setError("Failed to fetch saved resumes and jobs descriptions.");
      } finally {
        setLoadingSaved(false);
      }
    };

    fetchSaved();
  }, []);

  const handleResumeModeChange = (nextMode: "manual" | "upload") => {
    setResumeMode(nextMode);
    setError("");

    if (nextMode === "manual") {
      setSelectedResumeFile(null);
    } else {
      setResume((prev) => ({ ...prev, rawText: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (
        resume.title.trim().length === 0 ||
        job.title.trim().length === 0 ||
        job.rawText.trim().length === 0 ||
        (resumeMode === "manual" && resume.rawText.trim().length === 0) ||
        (resumeMode === "upload" && !selectedResumeFile)
      ) {
        toast.error("Please fill in all required fields or upload the resume PDF file.");
        setSaving(false);
        return;
      }

      setAnalyzeResult(null);

      if (!resumeId) {
        if (resumeMode === "manual") {
          const res = await api.post("/resumes", resume);
          toast.success("Resume saved successfully.");
          setResumeId(res.data.id);
        } else {
          const formData = new FormData();
          formData.append("file", selectedResumeFile as File);
          formData.append("title", resume.title.trim());

          const res = await api.post("/resumes/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Resume uploaded and saved successfully.");
          setResumeId(res.data.id);
          setSelectedResumeFile(null);
        }
      } else {
        if (resumeMode === "manual") {
          await api.put(`/resumes/${resumeId}`, resume);
          toast.success("Resume updated successfully.");
        }
      }

      if (!jobId) {
        const res = await api.post("/jobs", job);
        toast.success("Job description saved successfully.");
        setJobId(res.data.id);
      } else {
        await api.put(`/jobs/${jobId}`, job);
      }
    } catch (error) {
      toast.error("Failed to save. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalyze(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    try {
      if (!resumeId || !jobId) {
        toast.error("Please save both the inputs and then try again.");
        setAnalyze(false);
        return;
      }
      setAnalyzeResult(null);
      const response = await api.post("/analysis", {
        resumeId,
        jobId,
      });
      setAnalyzeResult(response.data);
      toast.success("Analysis completed.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to Analyze. Please try again later."
      );
    } finally {
      setAnalyze(false);
    }
  };

  return (
    <AppShell
      title="New Analysis"
      subtitle="Create a new resume-job match and review detailed ATS insights."
      theme={themeProps.theme}
      toggleTheme={themeProps.toggleTheme}
    >
      <div className="space-y-6">
        <Card className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-300/60 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-sky-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Quick Analyze (Saved Items)
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select an existing resume and job to run analysis instantly.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 bg-white/40 dark:bg-slate-900/30">
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select Resume</option>
                {savedResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select Job</option>
                {savedJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={async () => {
                if (!selectedResumeId || !selectedJobId) {
                  setError("Please select both resume and job.");
                  return;
                }

                try {
                  setAnalyze(true);
                  setAnalyzeResult(null);

                  const res = await api.post("/analysis", {
                    resumeId: selectedResumeId,
                    jobId: selectedJobId,
                  });

                  setAnalyzeResult(res.data);
                } catch (err: any) {
                  setError(err?.response?.data?.error || "Failed to analyze.");
                } finally {
                  setAnalyze(false);
                }
              }}
              disabled={analyzing || !selectedResumeId || !selectedJobId}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Analyze Saved Pair →
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-300/60 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-sky-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                Quick Analyze
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Run a new ATS match
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Paste your resume and job description to generate an instant
                match score and improvement insights.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 bg-white/40 dark:bg-slate-900/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ResumeEditor
                  title={resume.title}
                  rawText={resume.rawText}
                  setFormData={setResume}
                  onSubmit={handleSubmit}
                  submitLabel="Save Inputs"
                  submittingLabel="Saving..."
                  isSubmitting={saving}
                  mode={resumeMode}
                  setMode={handleResumeModeChange}
                  selectedFile={selectedResumeFile}
                  onFileChange={setSelectedResumeFile}
                  onDropFile={setSelectedResumeFile}
                  layout="panel"
                  badge="Resume"
                  titleText="Resume"
                  description="Add your resume by pasting text or uploading a PDF."
                />

                <div className="space-y-4 rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-indigo-50/35 to-sky-50/35 p-5 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/70">
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-full border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
                      Step 2
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Job Description
                    </h3>
                  </div>

                  <Input
                    name="title"
                    placeholder="Job title (e.g. Backend Engineer)"
                    value={job.title}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setJob((prev) => ({ ...prev, [name]: value }));
                    }}
                    className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />

                  <Textarea
                    name="rawText"
                    placeholder="Paste the job description..."
                    rows={10}
                    value={job.rawText}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setJob((prev) => ({ ...prev, [name]: value }));
                    }}
                    className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-300/70 pt-4 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={saving}
                  className="border-slate-300 bg-white/90 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  {saving ? "Saving..." : "Save Inputs"}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeId || !jobId}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analyzing ? "Analyzing..." : "Analyze Match →"}
                </Button>
              </div>
            </form>

            {error && (
              <div className="rounded-xl border border-rose-300/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-300/60 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-sky-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Analysis Result
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Detailed ATS score breakdown and improvement insights.
            </p>
          </CardHeader>

          <CardContent className="bg-white/40 dark:bg-slate-900/30">
            {analyzing ? (
              <div className="rounded-3xl border border-indigo-300/40 bg-gradient-to-br from-slate-50 via-indigo-50/35 to-sky-50/40 p-8 shadow-xl shadow-slate-200/30 dark:border-indigo-500/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/30">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Analyzing your resume
                  </h3>
                </div>

                <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
                  We are processing your resume against the job description and generating insights.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300/60 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    {currentStep > 1 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓
                      </div>
                    ) : currentStep === 1 ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                    <p
                      className={`text-sm ${
                        currentStep === 1
                          ? "text-slate-800 dark:text-slate-200"
                          : currentStep > 1
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      Parsing resume content
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-300/60 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    {currentStep > 2 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓
                      </div>
                    ) : currentStep === 2 ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                    <p
                      className={`text-sm ${
                        currentStep === 2
                          ? "text-slate-800 dark:text-slate-200"
                          : currentStep > 2
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      Matching against job description
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-300/60 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    {currentStep > 3 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓
                      </div>
                    ) : currentStep === 3 ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                    <p
                      className={`text-sm ${
                        currentStep === 3
                          ? "text-slate-800 dark:text-slate-200"
                          : currentStep > 3
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      Extracting skills and keywords
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-300/60 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    {currentStep > 4 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓
                      </div>
                    ) : currentStep === 4 ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                    <p
                      className={`text-sm ${
                        currentStep === 4
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      Generating ATS insights
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${currentStep * 25}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : !analyzeResult ? (
              <div className="rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/35 px-6 py-10 text-center dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/60">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/70 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    ⚡
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    No analysis yet
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    Run your analysis to see how well your resume matches a job and get actionable insights.
                  </p>
                </div>
              </div>
            ) : (
              <AnalysisResultView analyzeResult={analyzeResult} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}