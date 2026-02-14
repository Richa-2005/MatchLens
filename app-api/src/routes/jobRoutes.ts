import express from 'express';
import { protect } from '../middleware/auth';
import { createJob,getJobs,getJobsById,deleteJob } from '../controllers/jobController';

const jobRoutes = express.Router();

jobRoutes.delete('/:id',protect,deleteJob);
jobRoutes.get('/:id',protect,getJobsById);
jobRoutes.get('/',protect,getJobs);
jobRoutes.post('/',protect,createJob);

export default jobRoutes;