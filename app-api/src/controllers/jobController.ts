
import { Request, Response} from 'express';
import { assertAuthenticated } from '../types/auth';
import { prisma } from '../lib/prisma';

export const createJob = async (req: Request, res: Response) => {
    try {
        assertAuthenticated(req);

        const { title, rawText, tags } = req.body;

        if (!title || !rawText) {
            return res.status(400).json({ error: "Title and rawText are required" });
        }

        const job = await prisma.jobDescription.create({
            data: {
                title,
                rawText,
                tags: Array.isArray(tags) ? tags : [],
                userId: req.user.userId
            }
        });

        return res.status(201).json({
            id: job.id,
            title: job.title,
            createdAt: job.createdAt
        });

    } catch (error: any) {
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getJobs = async(req: Request, res:Response) =>{
    try{
        assertAuthenticated(req);

        const jobs = await prisma.jobDescription.findMany({
            where : {
                userId : req.user.userId
            },
            select : {
                id: true,
                title: true,
                tags : true,
                createdAt : true,
                updatedAt : true
            },
            orderBy : {createdAt: "desc"} //send from new to old
        });

        res.status(200).json(jobs);
    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getJobsById = async(req: Request, res:Response) =>{
    try{
        assertAuthenticated(req);

        const jobId = req.params.id;
        const jobs = await prisma.jobDescription.findFirst({
            where : {
                id : jobId as string,
                userId : req.user.userId
            },
            select : {
                id: true,
                title: true,
                rawText : true,
                tags : true,
                createdAt : true,
                updatedAt : true
            }
        });

        if(!jobs){
            return res.status(404).json({message: "No such job exists."});
        }

        res.status(200).json(jobs);
    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}