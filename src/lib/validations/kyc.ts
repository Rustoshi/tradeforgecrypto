import { z } from "zod";

// Document types supported for KYC
export const documentTypes = [
  { id: "PASSPORT", name: "Passport", requiresBack: false },
  { id: "DRIVERS_LICENSE", name: "Driver's License", requiresBack: true },
  { id: "NATIONAL_ID", name: "National ID Card", requiresBack: true },
  { id: "RESIDENCE_PERMIT", name: "Residence Permit", requiresBack: true },
] as const;

export type KYCDocumentType = typeof documentTypes[number]["id"];

// User KYC submission schema
export const submitKYCSchema = z.object({
  documentType: z.enum(["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID", "RESIDENCE_PERMIT"]),
  documentFrontUrl: z.string().url("Document front image is required"),
  documentBackUrl: z.string().url("Document back image is required").optional(),
  selfieUrl: z.string().url("Selfie image is required"),
});

// Admin review schema
export const reviewKYCSchema = z.object({
  kycId: z.string(),
  status: z.enum(["APPROVED", "DECLINED"]),
  rejectionReason: z.string().optional(),
});

export const kycFilterSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "DECLINED"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type SubmitKYCInput = z.infer<typeof submitKYCSchema>;
export type ReviewKYCInput = z.infer<typeof reviewKYCSchema>;
export type KYCFilterInput = z.infer<typeof kycFilterSchema>;
