import { useState, useEffect } from "react";
import api from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/AppShell";
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
  matchedSkills: string[];
  missingSkills: string[];
  highImpactMissing: string[];
  signals: {
    skillOverlap: number;
    keywordOverlap: number;
    tfidfSimilarity: number;
  };
  createdAt: string;
  resumeId: string | null;
  jobDescriptionId: string | null;
  explanation: string[];
};

export default function NewAnalysis() {
  const [resume, setResume] = useState<AnalysisInput>({ title: "", rawText: "" });
  const [job, setJob] = useState<AnalysisInput>({ title: "", rawText: "" });

  const [saving, setSaving] = useState<boolean>(false);
  const [analyzing, setAnalyze] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);

  const [currentStep, setCurrentStep] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (
        resume.title.trim().length === 0 ||
        resume.rawText.trim().length === 0 ||
        job.title.trim().length === 0 ||
        job.rawText.trim().length === 0
      ) {
        setError("Please fill all fields for both Resume and Job.");
        setSaving(false);
        return;
      }

      setAnalyzeResult(null);

      if (!resumeId) {
        const res = await api.post("/resumes", resume);
        setResumeId(res.data.id);
      } else {
        await api.put(`/resumes/${resumeId}`, resume);
      }

      if (!jobId) {
        const res = await api.post("/jobs", job);
        setJobId(res.data.id);
      } else {
        await api.put(`/jobs/${jobId}`, job);
      }
    } catch (error) {
      setError("Failed to save. Please try again later.");
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
        setError("Please save both the inputs and then try again.");
        setAnalyze(false);
        return;
      }
      setAnalyzeResult(null);
      const response = await api.post("/analysis", {
        resumeId,
        jobId,
      });
      setAnalyzeResult(response.data);
    } catch (error: any) {
      console.log(error?.response?.status);
      console.log(error?.response?.data);
      setError(
        error?.response?.data?.error ||
          "Failed to Analyze. Please try again later."
      );
    } finally {
      setAnalyze(false);
    }
  };

  const getSummaryContent = (result: AnalyzeResult) => {
    const score = result.overallScore;
    const highImpactCount = result.highImpactMissing.length;
    const missingCount = result.missingSkills.length;
    
    //defualt values
    let badge = "Needs Work";
    let badgeClasses =
      "border-amber-500/20 bg-amber-500/10 text-amber-300";
    let title =
      "The resume has some alignment, but major improvements are needed to compete strongly.";
    let subtitle =
      "Focus on clearer relevance, stronger keywords, and more measurable impact.";
    let recommendation = "Strengthen core relevance";

    if (score >= 80) {
      badge = "Strong Match";
      badgeClasses =
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
      title =
        "Strong alignment with the role, with clear potential to perform well in ATS screening.";
      subtitle =
        "Your resume reflects the job well. Small improvements can make it even sharper.";
      recommendation = "Polish and prioritize strongest evidence";
    } else if (score >= 65) {
      badge = "Strong Potential";
      badgeClasses =
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
      title =
        "Strong technical alignment, but the resume could show clearer impact and stronger context for the role.";
      subtitle =
        "Your resume matches important job requirements, but adding measurable outcomes and sharper role relevance could improve your ATS strength further.";
      recommendation =
        highImpactCount > 0
          ? "Address high-impact missing skills"
          : "Improve impact statements";
    } else if (score >= 45) {
      badge = "Average Match";
      badgeClasses =
        "border-amber-500/20 bg-amber-500/10 text-amber-300";
      title =
        "The resume shows partial alignment, but several important requirements are still underrepresented.";
      subtitle =
        "Improving keyword coverage and emphasizing more relevant experience will help increase the match.";
      recommendation =
        missingCount > 0
          ? "Add missing keywords naturally"
          : "Improve role targeting";
    } else {
      badge = "Low Match";
      badgeClasses =
        "border-rose-500/20 bg-rose-500/10 text-rose-300";
      title =
        "The resume is currently weakly aligned with the target role and may be filtered out early.";
      subtitle =
        "You need stronger job-specific relevance, clearer skills coverage, and better evidence of fit.";
      recommendation = "Rework resume for this role";
    }

    return { badge, badgeClasses, title, subtitle, recommendation };
};

  return (
    <AppShell
      title="New Analysis"
      subtitle="Create a new resume-job match and review detailed ATS insights."
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
          <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/70">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
                Quick Analyze
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-50">
                Run a new ATS match
              </CardTitle>
              <p className="text-sm text-slate-400">
                Paste your resume and job description to generate an instant
                match score and improvement insights.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 bg-slate-900/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-5 shadow-sm">
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                      Step 1
                    </div>
                    <h3 className="text-lg font-semibold text-slate-50">
                      Resume
                    </h3>
                  </div>

                  <Input
                    name="title"
                    placeholder="Resume title (e.g. Backend Resume)"
                    value={resume.title}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setResume((prev) => ({ ...prev, [name]: value }));
                    }}
                    className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />

                  <Textarea
                    name="rawText"
                    placeholder="Paste your resume content..."
                    rows={10}
                    value={resume.rawText}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setResume((prev) => ({ ...prev, [name]: value }));
                    }}
                    className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-5 shadow-sm">
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                      Step 2
                    </div>
                    <h3 className="text-lg font-semibold text-slate-50">
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
                    className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
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
                    className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={saving}
                  className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
                >
                  {saving ? "Saving..." : "Save Inputs"}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeId || !jobId}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? "Analyzing..." : "Analyze Match →"}
                </Button>
              </div>
            </form>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle className="text-slate-50">Analysis Result</CardTitle>
            <p className="text-sm text-slate-400">
              Detailed ATS score breakdown and improvement insights.
            </p>
          </CardHeader>

          <CardContent>
            {analyzing ? (
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-xl shadow-black/30">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-50">
                  Analyzing your resume
                </h3>
              </div>

              <p className="mb-8 text-sm text-slate-400">
                We are processing your resume against the job description and generating insights.
              </p>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  {currentStep > 1 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                      ✓
                    </div>
                  ) : currentStep === 1 ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  )}
                  <p
                    className={`text-sm ${
                      currentStep === 1
                        ? "text-slate-200"
                        : currentStep > 1
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    Parsing resume content
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  {currentStep > 2 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                      ✓
                    </div>
                  ) : currentStep === 2 ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  )}
                  <p
                    className={`text-sm ${
                      currentStep === 2
                        ? "text-slate-200"
                        : currentStep > 2
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    Matching against job description
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  {currentStep > 3 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                      ✓
                    </div>
                  ) : currentStep === 3 ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  )}
                  <p
                    className={`text-sm ${
                      currentStep === 3
                        ? "text-slate-200"
                        : currentStep > 3
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    Extracting skills and keywords
                  </p>
                </div>

                {/* Step 4 */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  {currentStep > 4 ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                      ✓
                    </div>
                  ) : currentStep === 4 ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  )}
                  <p
                    className={`text-sm ${
                      currentStep === 4
                        ? "text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    Generating ATS insights
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${currentStep * 25}%` }}
                  />
                </div>
              </div>
            </div>

            ) : !analyzeResult ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-12 text-center">
                  <div className="mb-3 h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-300">
                    ⚡
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    No analysis yet
                  </h3>
                  <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    Run your first analysis to see how well your resume matches a job and get actionable insights.
                  </p>
                </div>
              </div>

            ) : (() => {
                  const summary = getSummaryContent(analyzeResult);

                  return (
                    <div className="space-y-5">
                      <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 p-6 shadow-xl shadow-black/20">
                    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
                      
                      {/* Score ring */}
                      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/60 p-6">
                        <div
                          className="relative flex h-40 w-40 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(
                              #6366f1 ${analyzeResult.overallScore * 3.6}deg,
                              #334155 ${analyzeResult.overallScore * 3.6}deg
                            )`,
                          }}
                        >
                          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-900">
                            <span className="text-4xl font-bold tracking-tight text-slate-50">
                              {analyzeResult.overallScore}
                            </span>
                            <span className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                              ATS Score
                            </span>
                          </div>
                        </div>

                        <div className={`mt-5 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${summary.badgeClasses}`}>
                          {summary.badge}
                        </div>
                      </div>

                    
                      <div className="space-y-4">
                        <div className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
                        ATS Insight Generated
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-indigo-300">
                          Overall Match Score
                        </p>

                        <h2 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-50 md:text-4xl">
                          {summary.title}
                        </h2>

                        <p className="max-w-3xl text-base text-slate-300">
                          {summary.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Probability
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-50">
                            {(analyzeResult.probabilityScore * 100).toFixed(1)}%
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Recommendation
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-50">
                            {summary.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-sm">
                    <h3 className="mb-3 font-semibold text-slate-100">
                      Matched Skills
                    </h3>
                    {analyzeResult.matchedSkills.length === 0 ? (
                      <p className="text-sm text-slate-400">None</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analyzeResult.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-sm">
                    <h3 className="mb-3 font-semibold text-slate-100">
                      Missing Skills
                    </h3>
                    {analyzeResult.missingSkills.length === 0 ? (
                      <p className="text-sm text-slate-400">None</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analyzeResult.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-sm">
                    <h3 className="mb-3 font-semibold text-slate-100">
                      High Impact Missing
                    </h3>
                    {analyzeResult.highImpactMissing.length === 0 ? (
                      <p className="text-sm text-slate-400">None</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analyzeResult.highImpactMissing.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-sm">
                  <h3 className="mb-3 font-semibold text-slate-100">
                    Signal Breakdown
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
              {/* Skill Overlap */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Skill Overlap</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {(analyzeResult.signals.skillOverlap * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${analyzeResult.signals.skillOverlap * 100}%` }}
                  />
                </div>
              </div>

              {/* Keyword Overlap */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Keyword Overlap</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {(analyzeResult.signals.keywordOverlap * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                    style={{ width: `${analyzeResult.signals.keywordOverlap * 100}%` }}
                  />
                </div>
              </div>

              {/* TF-IDF Similarity */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">TF-IDF Similarity</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {(analyzeResult.signals.tfidfSimilarity * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                    style={{ width: `${analyzeResult.signals.tfidfSimilarity * 100}%` }}
                  />
                </div>
              </div>
            </div>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-3">
              {/* What's Working */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-50">What&apos;s Working</h3>
                    <p className="text-xs text-emerald-300">Strengths detected</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  {analyzeResult.matchedSkills.length > 0 ? (
                    <>
                      <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                        <p className="font-medium text-slate-100">Relevant skill alignment</p>
                        <p className="mt-1 text-slate-400">
                          Your resume matches important job skills like{" "}
                          {analyzeResult.matchedSkills.slice(0, 3).join(", ")}.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                        <p className="font-medium text-slate-100">Strong ATS compatibility</p>
                        <p className="mt-1 text-slate-400">
                          Skill overlap is{" "}
                          {(analyzeResult.signals.skillOverlap * 100).toFixed(1)}%, which
                          suggests good baseline alignment with the job description.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                      <p className="text-slate-400">
                        No strong positives detected yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Issues Found */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                      !
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-50">Issues Found</h3>
                      <p className="text-xs text-amber-300">Areas needing attention</p>
                    </div>
                  </div>

                  <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400">
                    {analyzeResult.missingSkills.length +
                      analyzeResult.highImpactMissing.length}{" "}
                    total
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  {analyzeResult.highImpactMissing.length > 0 && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                      <div className="mb-2 inline-flex rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300">
                        HIGH IMPACT
                      </div>
                      <p className="font-medium text-slate-100">
                        Missing critical skills
                      </p>
                      <p className="mt-1 text-slate-400">
                        Important skills like{" "}
                        {analyzeResult.highImpactMissing.slice(0, 3).join(", ")} are not
                        reflected in the resume.
                      </p>
                    </div>
                  )}

                  {analyzeResult.missingSkills.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <div className="mb-2 inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                        MEDIUM
                      </div>
                      <p className="font-medium text-slate-100">
                        Skill coverage can improve
                      </p>
                      <p className="mt-1 text-slate-400">
                        Some job requirements are still missing, which may lower ATS ranking
                        and recruiter confidence.
                      </p>
                    </div>
                  )}

                  {analyzeResult.highImpactMissing.length === 0 &&
                    analyzeResult.missingSkills.length === 0 && (
                      <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                        <p className="font-medium text-slate-100">No major issues found</p>
                        <p className="mt-1 text-slate-400">
                          Your resume appears well aligned with the current job description.
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Tips to Improve */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                    ↗
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-50">Tips to Improve</h3>
                    <p className="text-xs text-indigo-300">Next best actions</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                    <p className="font-medium text-slate-100">Add missing keywords naturally</p>
                    <p className="mt-1 text-slate-400">
                      Reflect the role’s language in project descriptions, tools, and
                      accomplishments where genuinely relevant.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                    <p className="font-medium text-slate-100">Strengthen measurable impact</p>
                    <p className="mt-1 text-slate-400">
                      Add outcomes like performance gains, number of users, API count,
                      deployment results, or scale to improve credibility.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                    <p className="font-medium text-slate-100">Prioritize the strongest match signals</p>
                    <p className="mt-1 text-slate-400">
                      Move the most relevant projects, tools, and technologies closer to the
                      top of the resume for faster recruiter scanning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
                              </div>
              );
            })()}
           
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}