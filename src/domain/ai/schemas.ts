import { z } from "zod";
import { contributionTypeSchema } from "@/domain/contribution/schemas";

export const aiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    reasoning: z.string().default(""),
  });

export const contributionAnalysisInputSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(8000),
  type: contributionTypeSchema,
  proof: z.string().min(1).max(2000),
  innovationContext: z.string().min(1).max(4000),
});

export const contributionAnalysisDataSchema = z.object({
  originality: z.number().int().min(0).max(100),
  effort: z.number().int().min(0).max(100),
  complexity: z.number().int().min(0).max(100),
  usefulness: z.number().int().min(0).max(100),
  impact: z.number().int().min(0).max(100),
  overallScore: z.number().int().min(0).max(100),
  reasoning: z.string().min(1).max(1200),
  confidence: z.number().int().min(0).max(100),
});

export const contributionAnalysisResponseSchema = aiEnvelopeSchema(contributionAnalysisDataSchema);

export const copilotInputSchema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().max(500).optional(),
  description: z.string().min(20).max(8000),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  currentTeam: z.array(z.string().min(1).max(80)).max(40).default([]),
  currentProgress: z.string().max(2000).default(""),
});

export const copilotDataSchema = z.object({
  inputQuality: z.enum(["CLEAR", "UNDER_SPECIFIED", "INVALID_OR_NOISY"]).default("UNDER_SPECIFIED"),
  planReliability: z.number().int().min(0).max(100).default(0),
  informationGaps: z.array(z.string()).max(12).default([]),
  clarifyingQuestions: z.array(z.string()).max(12).default([]),
  requiredRoles: z.array(z.string()).max(20),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        estimatedTime: z.string(),
      }),
    )
    .max(12),
  timeline: z.string(),
  budgetEstimate: z.string(),
  risks: z.array(z.string()).max(12),
  opportunities: z.array(z.string()).max(12),
  successProbability: z.number().int().min(0).max(100),
  reasoning: z.string(),
});

export const copilotResponseSchema = aiEnvelopeSchema(copilotDataSchema);

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

export const innovationDraftInputSchema = z.object({
  githubUrl: z.preprocess(emptyToUndefined, z.string().url().optional()),
  prompt: z.string().min(10).max(4000),
});

// Lenient on the way out of Gemini: the service trims/clamps fields to the
// stricter createInnovationSchema limits so the generated draft is submittable.
export const innovationDraftDataSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(400),
  description: z.string().min(1).max(12000),
  category: z.string().min(1).max(120),
  tags: z.array(z.string().min(1).max(60)).max(16).default([]),
  githubUrl: z.preprocess(emptyToUndefined, z.string().optional()),
  websiteUrl: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const innovationDraftResponseSchema = aiEnvelopeSchema(innovationDraftDataSchema);

export const bountySubmissionAnalysisInputSchema = z.object({
  bountyTitle: z.string().min(1).max(200),
  bountyDescription: z.string().min(1).max(8000),
  bountyCategory: z.string().min(1).max(40),
  submissionDescription: z.string().min(1).max(8000),
  evidenceLinks: z.array(z.string().max(512)).max(20).default([]),
  // Prior submissions on the same bounty, for duplicate detection.
  priorSubmissions: z.array(z.string().max(2000)).max(20).default([]),
});

export const bountySubmissionAnalysisDataSchema = z.object({
  summary: z.string().min(1).max(1200),
  qualityScore: z.number().int().min(0).max(100),
  qualityAssessment: z.string().min(1).max(1600),
  suggestedReviewNotes: z.string().min(1).max(1200),
  duplicateRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  duplicateReasoning: z.string().max(1200).default(""),
  strengths: z.array(z.string().max(400)).max(8).default([]),
  concerns: z.array(z.string().max(400)).max(8).default([]),
});

export const bountySubmissionAnalysisResponseSchema = aiEnvelopeSchema(bountySubmissionAnalysisDataSchema);

export type ContributionAnalysisInput = z.infer<typeof contributionAnalysisInputSchema>;
export type ContributionAnalysisData = z.infer<typeof contributionAnalysisDataSchema>;
export type CopilotInput = z.infer<typeof copilotInputSchema>;
export type CopilotData = z.infer<typeof copilotDataSchema>;
export type InnovationDraftInput = z.infer<typeof innovationDraftInputSchema>;
export type InnovationDraftData = z.infer<typeof innovationDraftDataSchema>;
export type BountySubmissionAnalysisInput = z.infer<typeof bountySubmissionAnalysisInputSchema>;
export type BountySubmissionAnalysisData = z.infer<typeof bountySubmissionAnalysisDataSchema>;
