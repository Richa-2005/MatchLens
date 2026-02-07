import express from 'express';
import { loginUser } from '../controllers/authController';

const authRoutes = express.Router();

authRoutes.post('/login',loginUser);

export default authRoutes;