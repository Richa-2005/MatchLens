import express from 'express';
import { protect } from '../middleware/auth';
import { createJob,getJobs,getJobsById,deleteJob, updateJob } from '../controllers/jobController';

const jobRoutes = express.Router();

jobRoutes.put('/:id',protect,updateJob);
jobRoutes.delete('/:id',protect,deleteJob);
jobRoutes.get('/:id',protect,getJobsById);
jobRoutes.get('/',protect,getJobs);
jobRoutes.post('/',protect,createJob);

export default jobRoutes;