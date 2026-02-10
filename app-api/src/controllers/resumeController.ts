import { Request, Response } from 'express';
import  { prisma } from '../lib/prisma'; //import the prisma client instance 
import { assertAuthenticated } from "../types/auth";

//The user will enter title , rawText, tags
export const createResume = async(req:Request, res: Response) => {
    try{
        assertAuthenticated(req);

        const {title,rawText,tags} = req.body;
        if(!title || !rawText){
            return res.status(401).json({message:"Enter all the fields."});
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