import { Request, Response } from "express";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { assertAuthenticated } from "../types/auth";

const applicationSelect = {
  id: true,
  jobDescriptionId: true,
  resumeId: true,
  analysisRunId: true,
  status: true,
  source: true,
  appliedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  resume: {
    select: {
      title: true,
    },
  },
  jobDescription: {
    select: {
      title: true,
    },
  },
};

const isValidStatus = (status: unknown): status is ApplicationStatus => {
  return (
    typeof status === "string" &&
    Object.values(ApplicationStatus).includes(status as ApplicationStatus)
  );
};

const parseAppliedAt = (appliedAt: unknown): Date | null | undefined => {
  if (appliedAt === undefined) return undefined;
  if (appliedAt === null || appliedAt === "") return null;
  if (typeof appliedAt !== "string") return undefined;

  const parsed = new Date(appliedAt);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed;
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const {
      jobDescriptionId,
      resumeId,
      analysisRunId,
      status,
      source,
      appliedAt,
      notes,
    } = req.body;

    if (!jobDescriptionId || !resumeId) {
      return res.status(400).json({ error: "jobDescriptionId and resumeId are required" });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({ error: "Invalid application status" });
    }

    const parsedAppliedAt = parseAppliedAt(appliedAt);
    if (appliedAt !== undefined && parsedAppliedAt === undefined) {
      return res.status(400).json({ error: "Invalid appliedAt date" });
    }

    const job = await prisma.jobDescription.findFirst({
      where: {
        id: jobDescriptionId,
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job description not found" });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (analysisRunId) {
      const analysisRun = await prisma.analysisRun.findFirst({
        where: {
          id: analysisRunId,
          userId: req.user.userId,
        },
        select: {
          id: true,
        },
      });

      if (!analysisRun) {
        return res.status(404).json({ error: "Analysis run not found" });
      }
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobDescriptionId_resumeId: {
          userId: req.user.userId,
          jobDescriptionId,
          resumeId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        error: "This resume is already being tracked for this job.",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.userId,
        jobDescriptionId,
        resumeId,
        analysisRunId: analysisRunId || undefined,
        status: status ?? ApplicationStatus.PLANNED,
        source,
        appliedAt: parsedAppliedAt,
        notes,
      },
      select: applicationSelect,
    });

    return res.status(201).json(application);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "This resume is already being tracked for this job.",
      });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.userId,
      },
      select: applicationSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(applications);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const id = req.params.id as string;
    const { status, source, appliedAt, notes } = req.body;
    const updateData: {
      status?: ApplicationStatus;
      source?: string | null;
      appliedAt?: Date | null;
      notes?: string | null;
    } = {};

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({ error: "Invalid application status" });
      }
      updateData.status = status;
    }

    if (source !== undefined) updateData.source = source;
    if (notes !== undefined) updateData.notes = notes;

    if (appliedAt !== undefined) {
      const parsedAppliedAt = parseAppliedAt(appliedAt);
      if (parsedAppliedAt === undefined) {
        return res.status(400).json({ error: "Invalid appliedAt date" });
      }
      updateData.appliedAt = parsedAppliedAt;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    const application = await prisma.application.update({
      where: {
        id,
      },
      data: updateData,
      select: applicationSelect,
    });

    return res.status(200).json(application);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const id = req.params.id as string;

    const result = await prisma.application.deleteMany({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    return res.status(200).json({ deleted: true });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
