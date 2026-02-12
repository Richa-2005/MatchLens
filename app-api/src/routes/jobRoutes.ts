import express from 'express';
import { protect } from '../middleware/auth';
import { createJob } from '../controllers/jobController';

const jobRoutes = express.Router();

jobRoutes.post('/',protect,createJob);

export default jobRoutes;