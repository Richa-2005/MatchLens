import crypto from "crypto";

export const generateContentHash = (resumeText: string, jobText: string): string => {
  return crypto
    .createHash("sha256")
    .update(`${resumeText}||${jobText}`, "utf8")
    .digest("hex");
};