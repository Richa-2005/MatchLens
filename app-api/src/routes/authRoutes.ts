import express from 'express';
import { loginUser, registerUser, meUser } from '../controllers/authController';
import {protect} from '../middleware/auth';

const authRoutes = express.Router();

authRoutes.post('/login',loginUser);
authRoutes.post('/register',registerUser);
authRoutes.get('/me',protect, meUser);

export default authRoutes;