import express from 'express';
import { analysisRun, getAnalysis, getAnalysisById } from '../controllers/analysisController';
import {protect} from '../middleware/auth';

const analysisRoutes = express.Router();

analysisRoutes.get('/:id', protect, getAnalysisById);
analysisRoutes.get('/', protect, getAnalysis);
analysisRoutes.post('/',protect,analysisRun);


export default analysisRoutes;