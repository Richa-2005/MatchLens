import {Request,Response} from 'express';
import {assertAuthenticated} from '../types/auth';
import {prisma} from '../lib/prisma';
import axios from 'axios';

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
        
        try{
            
            const mlResult = await axios.post(`${mlURL}/analyze`, {
                resume: resume.rawText,
                job: job.rawText
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

                    signals: mlResult.data.signals,
                    skills: {
                        matched: mlResult.data.matchedSkills,
                        related: mlResult.data.relatedSkills,
                        missing: mlResult.data.missingSkills,
                        highImpactMissing: mlResult.data.highImpactMissing,
                    },
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
        }

    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
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