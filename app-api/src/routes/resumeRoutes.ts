import express from 'express';
import { createResume, detailedResume, getResumes } from '../controllers/resumeController';
import { protect } from '../middleware/auth';

const resumeRoutes = express.Router();
resumeRoutes.get('/:id',protect,detailedResume);
resumeRoutes.get('/',protect, getResumes);
resumeRoutes.post('/',protect, createResume);

export default resumeRoutes;