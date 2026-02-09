import express from 'express';
import { createResume } from '../controllers/resumeController';
import { protect } from '../middleware/auth';

const resumeRoutes = express.Router();

resumeRoutes.post('/',protect, createResume);

export default resumeRoutes;