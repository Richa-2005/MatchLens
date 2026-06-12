export type AnalysisSummary = {
  profileSummary: string;
  recruiterView: string;
};

export type RoleMatch = {
  resumeRole: string;
  jobRole: string;
  matchScore: number;
  resumeConfidence: number;
  jobConfidence: number;
  resumeRoleScores: Record<string, number>;
  jobRoleScores: Record<string, number>;
};

export type AnalysisSignals = {
  skillOverlap: number;
  keywordOverlap: number;
  semanticSimilarity: number;
  impactScore: number;
  relatedSkillBonus: number;
  sectionSemanticScores: {
    skills: number;
    projects: number;
    experience: number;
    other: number;
  };
  roleMatchScore: number;
  roleMatch: RoleMatch;
  keywordQualityScore: number;
  keywordStuffingRisk: "low" | "medium" | "high" | string;
  overusedKeywords: string[];
};

export type AnalyzeResult = {
  id: string;
  overallScore: number;
  probabilityScore: number;
  summary: AnalysisSummary | null;
  skills: {
    matched: string[];
    related: string[];
    missing: string[];
    highImpactMissing: string[];
  };
  signals: AnalysisSignals;
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

export type AnalysisListItem = {
  id: string;
  overallScore: number;
  probabilityScore: number;
  createdAt: string;
  analysisVersion?: string;
  resumeId: string;
  jobDescriptionId: string;
  resume: {
    title: string;
  };
  jobDescription: {
    title: string;
  };
};

export type HistoryInsights = {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  repeatedMissingSkills: string[];
  commonWeakSignals: string[];
  trend: string;
};

export type ResumeRecommendation = {
  resumeId: string;
  resumeTitle: string;
  jobId: string;
  jobTitle: string;
  overallScore: number;
  probabilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  highImpactMissing: string[];
  summary?: AnalysisSummary | null;
  recommendation: string;
};