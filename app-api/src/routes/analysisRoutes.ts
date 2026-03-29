import express from 'express';
import { analysisRun, 
    getAllAnalysis, 
    getAnalysis, 
    getAnalysisById,
    getAnalysisList
 } from '../controllers/analysisController';
import {protect} from '../middleware/auth';

const analysisRoutes = express.Router();


analysisRoutes.get('/',protect,getAnalysisList);
analysisRoutes.get('/all',protect,getAllAnalysis);
analysisRoutes.get('/:id', protect, getAnalysisById);
analysisRoutes.get('/', protect, getAnalysis);
analysisRoutes.post('/',protect,analysisRun);


export default analysisRoutes;