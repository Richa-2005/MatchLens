export const cleanResumeText = (text: string): string => {
  let cleaned = text;

  // remove page markers like "-- 1 of 2 --"
  cleaned = cleaned.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, " ");

  // remove multiple newlines
  cleaned = cleaned.replace(/\n+/g, " ");

  // remove extra spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
};