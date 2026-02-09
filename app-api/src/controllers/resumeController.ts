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
                userId : req.user.userId as string
            }
        });
        
        //send confiramtion that new resume is saved in database successfully 
        res.status(201).json({
            id : resume.id , 
            title : resume.title, 
            createdAt : resume.createdAt
        });

    }catch(err: any){
        if (err?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}