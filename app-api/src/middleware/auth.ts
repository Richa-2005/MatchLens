import jwt, { JwtPayload } from 'jsonwebtoken';
import {Request, Response , NextFunction} from 'express';

// Extend the Express Request interface to include the user property [TS namespace : user]
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const protect = (req : Request ,res : Response,next : NextFunction)  => {
    let token : string | undefined;  //either the headers have the token or not 
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;

            req.user = decoded; 

            return next();
        }catch(error){
            console.error(error);
            res.status(401).json({error:"Not authorized, token failed"});
        }
    }
    
    return res.status(401).json({error:"Not authorized, no token"});
    
}