import { Request, Response } from 'express';
import  { prisma } from '../lib/prisma'; //import the prisma client instance 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { assertAuthenticated } from "../types/auth";

export const loginUser = async(req : Request,res : Response) => {
    
    try{
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        //first find if user exists
        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        });

        if(!user){
            return res.status(404).json({message:"Invalid email"});
        }
        
        //match the password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password.' });
        }
        
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT secret not configured." });
        }
        //assign the token
        const token = jwt.sign(
            {
                userId: user.id,
                email : user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

        //send the token and user details in response -> 
        //user token is then stored in req.headers.authorization in frontend and sent with every request to protected routes 
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name? user.name : "",
                email: user.email,
            }
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Server error' }); 
    }
}

export const registerUser = async(req : Request, res: Response) => {
    try{
        const {name,email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({ error: "Email and password are required." });
        }

        //check if user already exists
        const existing = await prisma.user.findUnique({
            where:{
                email : email
            }
        });
        if(existing){
            return res.status(401).json({error:"User with this email already exists."});
        }
        
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password,salt);

        //create the user in databse
        const newUser = await prisma.user.create({
            data : {
                name : name,
                email : email,
                passwordHash : passwordHash
            }
        });

        res.status(200).json({message : "User registered successfully"}); 
    }catch(error){
        console.log(error);
        res.status(401).json({error:"Internal server error , please try again later"});
    }
}

export const meUser = async(req:Request, res:Response) => {
    try{
        assertAuthenticated(req); //Makes requests 's type is AuthenticatedRequest or not.

        const userId = req.user;
        
        const user = await prisma.user.findUnique({
            where : {
                id : userId.userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })

        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        res.status(200).json(user);
    }catch(err : any){
        if (err?.message === "UNAUTHORIZED") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}