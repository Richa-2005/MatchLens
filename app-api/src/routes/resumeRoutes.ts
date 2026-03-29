import express from 'express';
import { uploadResume } from "../middleware/upload";
import { 
    createResume, 
    deleteResume, 
    detailedResume, 
    getResumes, 
    updateOldResume, 
    versionResume,
    uploadResumeController
} from '../controllers/resumeController';

import { protect } from '../middleware/auth';

const resumeRoutes = express.Router();

resumeRoutes.post("/upload", protect, uploadResume.single("file"), uploadResumeController);
resumeRoutes.post('/:id/version',protect,versionResume);
resumeRoutes.put('/:id',protect,updateOldResume);
resumeRoutes.delete('/:id',protect,deleteResume);
resumeRoutes.get('/:id',protect,detailedResume);
resumeRoutes.get('/',protect, getResumes);
resumeRoutes.post('/',protect, createResume);

export default resumeRoutes;