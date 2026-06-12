import {Request,Response} from 'express';
import {assertAuthenticated} from '../types/auth';
import {prisma} from '../lib/prisma';
import axios from 'axios';
import { cleanResumeText } from "../utils/textCleaner";
import { generateContentHash } from "../utils/hash";


const mlURL = process.env.ML_API_URL as string;
const ANALYSIS_VERSION = "v2";

export const analysisRun = async(req: Request, res: Response) => {
    try{
        assertAuthenticated(req);

        const {resumeId, jobId} = req.body;
        if (!resumeId || !jobId) return res.status(400).json({ error: "resumeId and jobId are required" });
        
        const resume = await prisma.resume.findFirst({
            where : {
                id : resumeId,
                userId : req.user.userId
            },
            select : {
                id: true,
                title: true,
                rawText : true,
                tags : true,
            }
        });

         const job = await prisma.jobDescription.findFirst({
            where : {
                id : jobId,
                userId : req.user.userId
            },
            select : {
                id: true,
                title: true,
                rawText : true,
                tags : true,
            }
        });

        if (!resume) return res.status(404).json({ error: "Resume not found." });
        if (!job) return res.status(404).json({ error: "Job description not found." });

        if (!resume.rawText || resume.rawText.length < 50) {
            return res.status(400).json({
                error: "Resume text is invalid or too short for analysis"
            });
        }

        if (!job.rawText || job.rawText.length < 50) {
            return res.status(400).json({
                error: "Job description is invalid or too short"
            });
        }
        const resumeText = cleanResumeText(resume.rawText);
        const jobText = cleanResumeText(job.rawText);

        const contentHash = generateContentHash(resumeText, jobText);

        try{
            const existingAnalysis = await prisma.analysisRun.findFirst({
            where: {
                userId: req.user.userId,
                contentHash: contentHash,
            },
            select: {
                id: true,
                overallScore: true,
                probabilityScore: true,
                analysisVersion: true,
                skills: true,
                summary: true,
                signals: true,
                insights: true,
                createdAt: true,
                resumeId: true,
                jobDescriptionId: true,
                explanation: true,
                resume: {
                select: {
                    title: true,
                },
                },
                jobDescription: {
                select: {
                    title: true,
                },
                },
            },
            });

            if (existingAnalysis) {
                return res.status(200).json(existingAnalysis);
            }

            console.log("Sending to ML:");
            console.log({
                resumeLength: resume.rawText.length,
                jobLength: job.rawText.length
            });
            
            const mlResult = await axios.post(`${mlURL}/analyze`, {
                resume: resumeText,
                job: jobText
            });
            const data = mlResult.data;

            if (!data || typeof data.overallScore !== "number") {
                throw new Error("Invalid ML response");
            }
            const analysis = await prisma.analysisRun.create({
                data: {
                    userId: req.user.userId,
                    resumeId : resumeId,
                    jobDescriptionId: jobId,

                    overallScore: mlResult.data.overallScore ,
                    probabilityScore: mlResult.data.probabilityScore,
                    analysisVersion: ANALYSIS_VERSION,
                    contentHash : contentHash,

                    signals: mlResult.data.signals,
                    skills: {
                        matched: mlResult.data.matchedSkills,
                        related: mlResult.data.relatedSkills,
                        missing: mlResult.data.missingSkills,
                        highImpactMissing: mlResult.data.highImpactMissing,
                    },
                    summary: mlResult.data.summary,
                    insights:mlResult.data.insights,
                    explanation: mlResult.data.explanation,
                    debug: { source: "ml-api-v2" }
                },
                select: {
                    id: true,
                    overallScore: true,
                    probabilityScore: true,
                    analysisVersion: true,
                    skills:true,
                    summary: true,
                    signals: true,
                    insights:true,
                    createdAt: true,
                    resumeId: true,
                    jobDescriptionId: true,
                    explanation : true
                }
        });

        return res.status(201).json(analysis);

        }catch(error:any){
            console.error("ML ERROR:", error?.response?.data || error.message);
            return res.status(502).json({
                error: "ML service failed to analyze this resume-job pair. Please try again later."
            });
        }

    }catch(error:any){
    console.error("ML ERROR:", error?.response?.data || error.message);
    return res.status(500).json({
        error: "Analysis failed due to ML service. Please try again later."
    });
}
}

export const getAllAnalysis = async(req:Request, res: Response) =>{
    try{
        assertAuthenticated(req);
        const { page = 1, limit = 10 } = req.query;

        const analysis = await prisma.analysisRun.findMany({
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            where : {
                userId : req.user.userId
            },
            select: {
                id: true,
                overallScore: true,
                probabilityScore: true,
                createdAt: true,
                analysisVersion: true,
                resumeId: true,
                jobDescriptionId: true,
                resume: {
                    select: {
                    title: true
                    }
                },
                jobDescription: {
                    select: {
                    title: true
                    }
                }
            },
            orderBy : {
                createdAt : "desc"
            }
        
        });
        
        return res.status(200).json(analysis);

    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAnalysis = async(req:Request, res: Response) =>{
    try{
        assertAuthenticated(req);

        const resumeId = req.query.resumeId as string | undefined;
        const jobId = req.query.jobId as string | undefined;

        if (!resumeId || !jobId) {
            return res.status(400).json({ error: "resumeId and jobId are required" });
        }

        const analysis = await prisma.analysisRun.findMany({
            where : {
                jobDescriptionId : jobId,
                resumeId : resumeId,
                userId : req.user.userId
            },
            select : {
                id : true,
                overallScore : true,
                probabilityScore: true,
                createdAt : true,
                analysisVersion: true,
                resumeId: true,
                jobDescriptionId: true,
                resume: {
                    select: {
                    title: true
                    }
                },
                jobDescription: {
                    select: {
                    title: true
                    }
                }
                
            },
            orderBy : {
                createdAt : "desc"
            }
        });
        
        return res.status(200).json(analysis);

    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAnalysisById = async(req:Request, res: Response) =>{
    try{
        assertAuthenticated(req);
        
        const analysisId = req.params.id as string | undefined;

        const analysis = await prisma.analysisRun.findUnique({
            where : {
                id : analysisId,
            },
            select : {
                id: true,
                userId:true,
                overallScore: true,
                probabilityScore: true,
                analysisVersion: true,
                skills:true,
                summary: true,
                signals: true,
                insights:true,
                createdAt: true,
                resumeId: true,
                jobDescriptionId: true,
                explanation : true,
                resume: {
                    select: {
                    title: true
                    }
                },
                jobDescription: {
                    select: {
                    title: true
                    }
                }
            }
            
        });
        
        if(!analysis){
            return res.status(404).json({
                message : "No such analysis exists."
            })
        }

        return res.status(200).json(analysis);

    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAnalysisList = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const { resumeId, jobId, search } = req.query;

    const where: any = {
      userId: req.user.userId,
    };

    if (resumeId) {
      where.resumeId = resumeId;
    }

    if (jobId) {
      where.jobDescriptionId = jobId;
    }

    if (search) {
      where.OR = [
        {
          resume: {
            title: {
              contains: String(search),
              mode: "insensitive",
            },
          },
        },
        {
          jobDescription: {
            title: {
              contains: String(search),
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const analyses = await prisma.analysisRun.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        overallScore: true,
        probabilityScore: true,
        createdAt: true,
        resumeId: true,
        jobDescriptionId: true,
        resume: {
          select: {
            title: true,
          },
        },
        jobDescription: {
          select: {
            title: true,
          },
        },
      },
    });

    return res.status(200).json(analyses);

  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const recommendBestResumeForJob = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    const job = await prisma.jobDescription.findFirst({
      where: {
        id: jobId,
        userId: req.user.userId,
      },
      select: {
        id: true,
        title: true,
        rawText: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job description not found." });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        title: true,
        rawText: true,
      },
    });

    if (resumes.length === 0) {
      return res.status(404).json({ error: "No resumes found." });
    }

    const jobText = cleanResumeText(job.rawText);

    const rankings: Array<{
      resumeId: string;
      resumeTitle: string;
      jobId: string;
      jobTitle: string;
      overallScore: number;
      probabilityScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      highImpactMissing: string[];
      summary: unknown;
      recommendation: string;
      source: "saved-analysis" | "ml-live";
    }> = [];

    const getRecommendationLabel = (overallScore: number) =>
      overallScore >= 70
        ? "Strong resume for this job"
        : overallScore >= 45
        ? "Usable, but should be improved"
        : "Not recommended without tailoring";

    for (const resume of resumes) {
      if (!resume.rawText || resume.rawText.length < 50) continue;

      const resumeText = cleanResumeText(resume.rawText);
      const contentHash = generateContentHash(resumeText, jobText);

      const existingAnalysis = await prisma.analysisRun.findFirst({
        where: {
          userId: req.user.userId,
          resumeId: resume.id,
          jobDescriptionId: job.id,
          contentHash,
        },
        select: {
          overallScore: true,
          probabilityScore: true,
          skills: true,
          summary: true,
        },
      });

      if (existingAnalysis) {
        const skills = existingAnalysis.skills as {
          matched?: string[];
          missing?: string[];
          highImpactMissing?: string[];
        };

        rankings.push({
          resumeId: resume.id,
          resumeTitle: resume.title,
          jobId: job.id,
          jobTitle: job.title,
          overallScore: existingAnalysis.overallScore,
          probabilityScore: existingAnalysis.probabilityScore,
          matchedSkills: skills.matched ?? [],
          missingSkills: skills.missing ?? [],
          highImpactMissing: skills.highImpactMissing ?? [],
          summary: existingAnalysis.summary,
          recommendation: getRecommendationLabel(existingAnalysis.overallScore),
          source: "saved-analysis",
        });

        continue;
      }

      const mlResult = await axios.post(`${mlURL}/analyze`, {
        resume: resumeText,
        job: jobText,
      });

      const data = mlResult.data;

      if (!data || typeof data.overallScore !== "number") {
        throw new Error("Invalid ML response");
      }

      rankings.push({
        resumeId: resume.id,
        resumeTitle: resume.title,
        jobId: job.id,
        jobTitle: job.title,
        overallScore: data.overallScore,
        probabilityScore: data.probabilityScore,
        matchedSkills: data.matchedSkills,
        missingSkills: data.missingSkills,
        highImpactMissing: data.highImpactMissing,
        summary: data.summary,
        recommendation: getRecommendationLabel(data.overallScore),
        source: "ml-live",
      });
    }

    rankings.sort((a, b) => b.overallScore - a.overallScore);

    return res.status(200).json(rankings);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error(error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to recommend resumes." });
  }
};

export const getAnalysisHistoryInsights = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const analyses = await prisma.analysisRun.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        overallScore: true,
        skills: true,
        signals: true,
        createdAt: true,
      },
    });

    if (analyses.length === 0) {
      return res.status(200).json({
        totalAnalyses: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        repeatedMissingSkills: [],
        commonWeakSignals: [],
        trend: "no data",
      });
    }

    const scores = analyses.map((a) => a.overallScore);
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const missingSkillCount: Record<string, number> = {};
    const weakSignals: Record<string, number> = {
      impactScore: 0,
      keywordOverlap: 0,
      skillOverlap: 0,
      roleMatchScore: 0,
    };

    analyses.forEach((analysis) => {
      const skills = analysis.skills as any;
      const signals = analysis.signals as any;

      skills?.missing?.forEach((skill: string) => {
        missingSkillCount[skill] = (missingSkillCount[skill] || 0) + 1;
      });

      if ((signals?.impactScore ?? 1) < 0.3) weakSignals.impactScore++;
      if ((signals?.keywordOverlap ?? 1) < 0.3) weakSignals.keywordOverlap++;
      if ((signals?.skillOverlap ?? 1) < 0.35) weakSignals.skillOverlap++;
      if ((signals?.roleMatchScore ?? 1) < 0.5) weakSignals.roleMatchScore++;
    });

    const repeatedMissingSkills = Object.entries(missingSkillCount)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill)
      .slice(0, 5);

    const commonWeakSignals = Object.entries(weakSignals)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([signal]) => signal);

    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;

    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
        : firstAvg;

    let trend = "stable";

    if (secondAvg - firstAvg >= 5) trend = "improving";
    else if (firstAvg - secondAvg >= 5) trend = "declining";

    return res.status(200).json({
      totalAnalyses: analyses.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      repeatedMissingSkills,
      commonWeakSignals,
      trend,
    });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error(error);
    return res.status(500).json({ error: "Failed to load history insights." });
  }
};

export const createAnalysisFeedback = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const  id  = req.params.id as string;
    const { helpful, outcome, note } = req.body;

    const analysis = await prisma.analysisRun.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    const feedback = await prisma.analysisFeedback.create({
      data: {
        userId: req.user.userId,
        analysisRunId: id as string,
        helpful,
        outcome,
        note,
      },
    });

    return res.status(201).json(feedback);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error(error);
    return res.status(500).json({ error: "Failed to save feedback." });
  }
};
