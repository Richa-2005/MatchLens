import express from 'express';
import { analysisRun, 
    getAllAnalysis, 
    getAnalysisById,
    getAnalysisList,
    recommendBestResumeForJob,
    getAnalysisHistoryInsights,
    createAnalysisFeedback
 } from '../controllers/analysisController';
import {protect} from '../middleware/auth';

const analysisRoutes = express.Router();


analysisRoutes.get('/all',protect,getAllAnalysis);
analysisRoutes.get("/insights/history", protect, getAnalysisHistoryInsights);
analysisRoutes.post("/recommend-resume", protect, recommendBestResumeForJob);

analysisRoutes.post("/:id/feedback", protect, createAnalysisFeedback);
analysisRoutes.get('/:id', protect, getAnalysisById);

analysisRoutes.get('/',protect,getAnalysisList);
analysisRoutes.post('/',protect,analysisRun);

export default analysisRoutes;
