import api from "@/api/axiosClient";
import  toast  from "react-hot-toast";
import type { AnalyzeResult } from "@/types/analysis";

type AnalysisProps = {
  analyzeResult: AnalyzeResult;
};

const getSummaryContent = (result: AnalyzeResult) => {
  const score = result.overallScore;
  const highImpactCount = result.skills.highImpactMissing.length;
  const missingCount = result.skills.missing.length;

  let badge = "Needs Work";
  let badgeClasses =
    "border-amber-500/20 bg-amber-100/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  let title =
    "The resume has some alignment, but major improvements are needed to compete strongly.";
  let subtitle =
    "Focus on clearer relevance, stronger keywords, and more measurable impact.";
  let recommendation = "Strengthen core relevance";

  if (score >= 80) {
    badge = "Strong Match";
    badgeClasses =
      "border-emerald-500/20 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    title =
      "Strong alignment with the role, with clear potential to perform well in ATS screening.";
    subtitle =
      "Your resume reflects the job well. Small improvements can make it even sharper.";
    recommendation = "Polish strongest evidence";
  } else if (score >= 65) {
    badge = "Strong Potential";
    badgeClasses =
      "border-emerald-500/20 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    title =
      "The resume shows strong potential, but clearer impact and role targeting would improve it further.";
    subtitle =
      "You match important requirements, but sharpening relevance and measurable outcomes can raise the score.";
    recommendation =
      highImpactCount > 0
        ? "Address high-impact missing skills"
        : "Improve measurable impact";
  } else if (score >= 45) {
    badge = "Average Match";
    badgeClasses =
      "border-amber-500/20 bg-amber-100/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    title =
      "The resume shows partial alignment, but several important requirements are still underrepresented.";
    subtitle =
      "Improving keyword coverage and emphasizing more relevant experience will help increase the match.";
    recommendation =
      missingCount > 0 ? "Add missing keywords naturally" : "Improve role targeting";
  } else {
    badge = "Low Match";
    badgeClasses =
      "border-rose-500/20 bg-rose-100/70 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
    title =
      "The resume is currently weakly aligned with the target role and may be filtered out early.";
    subtitle =
      "You need stronger job-specific relevance, clearer skills coverage, and better evidence of fit.";
    recommendation = "Rework resume for this role";
  }

  return { badge, badgeClasses, title, subtitle, recommendation };
};

function SignalCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="rounded-xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {(value * 100).toFixed(1)}%
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-300/70 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
      )}
    </div>
  );
}

function InsightList({
  title,
  subtitle,
  icon,
  borderClass,
  bgClass,
  textClass,
  items,
  emptyText,
}: {
  title: string;
  subtitle: string;
  icon: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${borderClass} ${bgClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${textClass} bg-white/70 dark:bg-slate-900/40`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <p className={`text-xs ${textClass}`}>{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-300/60 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">{emptyText}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-300/60 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/50"
            >
              <p className="text-slate-700 dark:text-slate-300">{item}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AnalysisResultView({ analyzeResult }: AnalysisProps) {
  const summary = getSummaryContent(analyzeResult);
  const roleMatch = analyzeResult.signals.roleMatch;
  const sectionScores = analyzeResult.signals.sectionSemanticScores;
  const stuffingRisk = analyzeResult.signals.keywordStuffingRisk;
  const overusedKeywords = analyzeResult.signals.overusedKeywords ?? [];

  const submitFeedback = async (helpful: boolean, outcome?: string) => {
    try {
      await api.post(`/analysis/${analyzeResult.id}/feedback`, {
        helpful,
        outcome,
      });

      toast.success("Feedback saved");
    } catch {
      toast.error("Failed to save feedback");
    }
  };
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-indigo-50/35 to-sky-50/40 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:shadow-black/20">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-300/70 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-900/60">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #6366f1 ${analyzeResult.overallScore * 3.6}deg,
                  #cbd5e1 ${analyzeResult.overallScore * 3.6}deg
                )`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {analyzeResult.overallScore}
                </span>
                <span className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  ATS Score
                </span>
              </div>
            </div>

            <div
              className={`mt-5 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${summary.badgeClasses}`}
            >
              {summary.badge}
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              ATS Insight Generated
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Overall Match Score
              </p>

              <h2 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl dark:text-slate-50">
                {summary.title}
              </h2>

              <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
                {summary.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-300/70 bg-white/75 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Probability
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {(analyzeResult.probabilityScore * 100).toFixed(1)}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-300/70 bg-white/75 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Recommendation
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {summary.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      {analyzeResult.summary && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-sky-300/50 bg-sky-50/70 p-5 dark:border-sky-500/20 dark:bg-sky-500/5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Profile Summary
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {analyzeResult.summary.profileSummary}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-300/50 bg-indigo-50/70 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Recruiter View
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {analyzeResult.summary.recruiterView}
            </p>
          </div>
        </div>
      )}

      {roleMatch && (
        <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-white/90 to-cyan-50/35 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            Role Match
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <InfoCard
              label="Resume Role"
              value={roleMatch.resumeRole.replaceAll("_", " ")}
              detail={`${(roleMatch.resumeConfidence * 100).toFixed(1)}% confidence`}
            />
            <InfoCard
              label="Job Role"
              value={roleMatch.jobRole.replaceAll("_", " ")}
              detail={`${(roleMatch.jobConfidence * 100).toFixed(1)}% confidence`}
            />
            <InfoCard
              label="Role Match Score"
              value={`${(analyzeResult.signals.roleMatchScore * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white/85 to-emerald-50/40 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-emerald-950/10">
    <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Matched Skills</h3>
    {analyzeResult.skills.matched.length === 0 ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">None</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {analyzeResult.skills.matched.map((s) => (
          <span
            key={s}
            className="rounded-full border border-emerald-500/20 bg-emerald-100/70 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>

  <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white/85 to-indigo-50/40 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-indigo-950/10">
    <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Related Skills</h3>
    {analyzeResult.skills.related.length === 0 ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">None</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {analyzeResult.skills.related.map((s) => (
          <span
            key={s}
            className="rounded-full border border-indigo-500/20 bg-indigo-100/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>

  <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white/85 to-amber-50/40 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-amber-950/10">
    <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Missing Skills</h3>
    {analyzeResult.skills.missing.length === 0 ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">None</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {analyzeResult.skills.missing.map((s) => (
          <span
            key={s}
            className="rounded-full border border-amber-500/20 bg-amber-100/70 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>

  <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white/85 to-rose-50/40 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:to-rose-950/10">
    <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
      High Impact Missing
    </h3>
    {analyzeResult.skills.highImpactMissing.length === 0 ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">None</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {analyzeResult.skills.highImpactMissing.map((s) => (
          <span
            key={s}
            className="rounded-full border border-rose-500/20 bg-rose-100/70 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>
</div>

      <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-white/90 to-indigo-50/35 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Signal Breakdown</h3>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SignalCard
            label="Skill Overlap"
            value={analyzeResult.signals.skillOverlap}
            gradient="from-blue-500 to-indigo-500"
          />
          <SignalCard
            label="Keyword Overlap"
            value={analyzeResult.signals.keywordOverlap}
            gradient="from-violet-500 to-purple-500"
          />
          <SignalCard
            label="Semantic Similarity"
            value={analyzeResult.signals.semanticSimilarity}
            gradient="from-cyan-500 to-teal-500"
          />
          <SignalCard
            label="Impact Score"
            value={analyzeResult.signals.impactScore}
            gradient="from-emerald-500 to-green-500"
          />
          <SignalCard
            label="Related Skill Bonus"
            value={analyzeResult.signals.relatedSkillBonus}
            gradient="from-pink-500 to-rose-500"
          />
          <SignalCard
            label="Keyword Quality"
            value={analyzeResult.signals.keywordQualityScore}
            gradient="from-yellow-500 to-orange-500"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InfoCard
            label="Keyword Stuffing Risk"
            value={stuffingRisk}
            detail={overusedKeywords.length > 0 ? `Overused: ${overusedKeywords.join(", ")}` : "No overused keywords detected"}
          />
          <InfoCard
            label="Keyword Quality Score"
            value={`${(analyzeResult.signals.keywordQualityScore * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      {sectionScores && (
        <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-white/90 to-violet-50/35 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            Section Semantic Scores
          </h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SignalCard
              label="Skills"
              value={sectionScores.skills}
              gradient="from-blue-500 to-indigo-500"
            />
            <SignalCard
              label="Projects"
              value={sectionScores.projects}
              gradient="from-emerald-500 to-teal-500"
            />
            <SignalCard
              label="Experience"
              value={sectionScores.experience}
              gradient="from-violet-500 to-purple-500"
            />
            <SignalCard
              label="Other"
              value={sectionScores.other}
              gradient="from-slate-500 to-slate-700"
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <InsightList
  title="What’s Working"
  subtitle="Strengths detected"
  icon="✓"
  borderClass="border-emerald-300/50 dark:border-emerald-500/20"
  bgClass="bg-gradient-to-br from-emerald-50/80 to-white/70 dark:bg-gradient-to-br dark:from-slate-800 dark:to-emerald-950/10"
  textClass="text-emerald-700 dark:text-emerald-300"
  items={analyzeResult.insights.strengths}
  emptyText="No strong positives detected yet."
/>

<InsightList
  title="Issues Found"
  subtitle="Areas needing attention"
  icon="!"
  borderClass="border-amber-300/50 dark:border-amber-500/20"
  bgClass="bg-gradient-to-br from-amber-50/80 to-white/70 dark:bg-gradient-to-br dark:from-slate-800 dark:to-amber-950/10"
  textClass="text-amber-700 dark:text-amber-300"
  items={analyzeResult.insights.issues}
  emptyText="No major issues found."
/>

<InsightList
  title="Tips to Improve"
  subtitle="Next best actions"
  icon="↗"
  borderClass="border-indigo-300/50 dark:border-indigo-500/20"
  bgClass="bg-gradient-to-br from-indigo-50/80 to-white/70 dark:bg-gradient-to-br dark:from-slate-800 dark:to-indigo-950/10"
  textClass="text-indigo-700 dark:text-indigo-300"
  items={analyzeResult.insights.tips}
  emptyText="No suggestions available."
/>
      </div>

      <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-white/90 to-sky-50/30 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Explanation</h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {analyzeResult.explanation.map((item, index) => (
            <li
              key={index}
              className="rounded-xl border border-slate-300/60 bg-white/75 p-3 dark:border-slate-700/70 dark:bg-slate-900/50"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-5 dark:border-slate-700 dark:bg-slate-800/60">
  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
    Was this analysis useful?
  </h3>

  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={() => submitFeedback(true)}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500"
    >
      Helpful
    </button>

    <button
      onClick={() => submitFeedback(false)}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-500"
    >
      Not helpful
    </button>

    <button
      onClick={() => submitFeedback(true, "interview")}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
    >
      Got Interview
    </button>

    <button
      onClick={() => submitFeedback(true, "rejected")}
      className="rounded-lg border border-slate-400 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
    >
      Rejected
    </button>
  </div>
</div>
    </div>
  );
}
