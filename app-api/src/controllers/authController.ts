import { Request, Response } from 'express';
import  { prisma } from '../lib/prisma'; //import the prisma client instance 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginUser = async(req : Request,res : Response) => {
    const {email,password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try{
        //first find if user exists
        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        });

        if(!user){
            return res.json({message:"Invalid email"});
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

        //send the token and user details in response
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