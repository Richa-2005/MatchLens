import { Request, Response } from 'express';
import  { prisma } from '../lib/prisma'; //import the prisma client instance 
import { assertAuthenticated } from "../types/auth";

//The user will enter title , rawText, tags
export const createResume = async(req:Request, res: Response) => {
    try{
        assertAuthenticated(req);

        const {title,rawText,tags} = req.body;
        if(!title || !rawText){
            return res.status(400).json({message:"Enter all the fields."});
        }

        //add the new resume to the table 'Resume'
        const resume = await prisma.resume.create({
            data : {
                title : title,
                rawText : rawText,
                tags: Array.isArray(tags) ? tags : [],
                userId : req.user.userId
            }
        });
        
        //send confiramtion that new resume is saved in database successfully 
        res.status(201).json({
            id : resume.id , 
            title : resume.title, 
            createdAt : resume.createdAt
        });

    }catch(error: any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getResumes = async(req: Request, res: Response) =>{
    try{
        assertAuthenticated(req); //tell Typesscript that it is an authenticated request and has user property

        const resumes = await prisma.resume.findMany({
            where : {
                userId : req.user.userId
            },
            select: {
                id: true,
                title: true,
                tags: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json(resumes);
        
    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const detailedResume = async(req: Request, res: Response) =>{
    try{
        assertAuthenticated(req); 

        const resume = await prisma.resume.findFirst({
            where : {
                id : req.params.id as string,
                userId : req.user.userId,
            },
            select: {
                id: true,
                title: true,
                rawText: true,
                tags: true,
                createdAt: true,
                updatedAt: true
            },
            
        });

        if (!resume) {
            return res.status(404).json({ error: "Resume not found" });
        }

        res.status(200).json(resume);
        
    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateOldResume = async(req: Request, res: Response) =>{
    try{
        assertAuthenticated(req);
        const {title,rawText,tags} = req.body;

        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (rawText !== undefined) updateData.rawText = rawText;
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

        //check if user actually sent any field to update or not
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Nothing to update." });
        }

        const updatedResume = await prisma.resume.updateMany({
            where : {
                id : req.params.id as string,
                userId : req.user.userId
            },
            data : updateData,
        })

        if(updatedResume.count == 0){
            return res.status(404).json({updated: false, message: "Resume not found"});
        }

        return res.status(200).json({ updated: true });
    }catch(error:any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const versionResume = async(req:Request, res: Response) =>{
    try{
        assertAuthenticated(req);
        const {title,rawText,tags} = req.body;
        
        const existingResume = await prisma.resume.findFirst({
            where : {
                id : req.params.id as string,
                userId : req.user.userId
            },
            select: {
                id: true,
                title: true,
                rawText: true,
                tags: true,
            },
            
        });

        if(!existingResume){
            return res.status(404).json({ created: false, message: "Resume not found" });
        }
        

        const merged = {
            title: title ?? existingResume.title,
            rawText: rawText ?? existingResume.rawText,
            tags: tags ?? existingResume.tags
        };

        const resume = await prisma.resume.create({
            data : {
                title : merged.title,
                rawText : merged.rawText,
                tags: Array.isArray(merged.tags) ? merged.tags : [],
                userId : req.user.userId
            }
        });
        
        //send confiramtion that new version of the resume is saved in database successfully 
        res.status(201).json({
            id : resume.id , 
            title : resume.title, 
            createdAt : resume.createdAt
        });
        

    }catch(error: any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteResume = async(req:Request, res: Response) => {
    try{
        assertAuthenticated(req);

        const result = await prisma.resume.deleteMany({
            where: {
                id: req.params.id as string,
                userId: req.user.userId
            }
        });
        
        if(result.count == 0){
            return res.status(404).json({deleted: false, message: "Resume not found"});
        }

        return res.status(200).json({ deleted: true });

    }catch(error :any){
        if (error?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}