import express from "express";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from "../controllers/applicationController";
import { protect } from "../middleware/auth";

const applicationRoutes = express.Router();

applicationRoutes.post("/", protect, createApplication);
applicationRoutes.get("/", protect, getApplications);
applicationRoutes.put("/:id", protect, updateApplication);
applicationRoutes.delete("/:id", protect, deleteApplication);

export default applicationRoutes;
