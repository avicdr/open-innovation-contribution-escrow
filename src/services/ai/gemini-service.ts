import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  bountySubmissionAnalysisResponseSchema,
  contributionAnalysisResponseSchema,
  copilotResponseSchema,
  innovationDraftResponseSchema,
  type BountySubmissionAnalysisData,
  type BountySubmissionAnalysisInput,
  type ContributionAnalysisData,
  type ContributionAnalysisInput,
  type CopilotData,
  type CopilotInput,
  type InnovationDraftData,
} from "@/domain/ai/schemas";

import { requireServerEnv } from "@/lib/config/env";

import {
  bountySubmissionAnalysisPrompt,
  contributionAnalysisPrompt,
  copilotPrompt,
  globalGeminiInstruction,
  innovationDraftPrompt,
  type InnovationDraftPromptInput,
} from "@/services/ai/prompts";

/**
 * -------------------------------------------------------
 * Singleton Gemini Client
 * -------------------------------------------------------
 */

const apiKey = requireServerEnv("GEMINI_API_KEY");

const genAi = new GoogleGenerativeAI(apiKey);

const model = genAi.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: globalGeminiInstruction,

  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,
  },
});

/**
 * -------------------------------------------------------
 * Optional Memory Cache
 * -------------------------------------------------------
 */

const cache = new Map<string, unknown>();

function cacheKey(prompt: string) {
  return prompt;
}

/**
 * -------------------------------------------------------
 * Gemini JSON Helper
 * -------------------------------------------------------
 */

async function generateJson<T>(prompt: string): Promise<T> {
  const key = cacheKey(prompt);

  const cached = cache.get(key);

  if (cached) {
    return cached as T;
  }

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  const parsed = JSON.parse(text) as T;

  cache.set(key, parsed);

  return parsed;
}

/**
 * -------------------------------------------------------
 * Contribution Analysis
 * -------------------------------------------------------
 */

export async function analyzeContribution(
  input: ContributionAnalysisInput,
): Promise<ContributionAnalysisData> {
  const payload = await generateJson(
    contributionAnalysisPrompt(input),
  );

  const parsed =
    contributionAnalysisResponseSchema.parse(payload);

  return parsed.data;
}

/**
 * -------------------------------------------------------
 * Copilot Plan
 * -------------------------------------------------------
 */

export async function generateCopilotPlan(
  input: CopilotInput,
): Promise<CopilotData> {
  const payload = await generateJson(
    copilotPrompt(input),
  );

  const parsed =
    copilotResponseSchema.parse(payload);

  return parsed.data;
}

/**
 * -------------------------------------------------------
 * Innovation Draft Helpers
 * -------------------------------------------------------
 */

function clamp(value: string, max: number) {
  return value.trim().slice(0, max);
}

function normalizeDraft(
  data: InnovationDraftData,
  githubUrl?: string,
): InnovationDraftData {
  const tags = Array.from(
    new Set(
      data.tags
        .map((tag) =>
          clamp(
            tag.replace(/^#/, "").toLowerCase(),
            40,
          ),
        )
        .filter(Boolean),
    ),
  ).slice(0, 12);

  return {
    title: clamp(data.title, 140),
    summary: clamp(data.summary, 280),
    description: clamp(data.description, 8000),
    category: clamp(data.category, 80),
    tags,
    githubUrl:
      githubUrl ??
      data.githubUrl ??
      "",
    websiteUrl:
      data.websiteUrl ??
      "",
  };
}

/**
 * -------------------------------------------------------
 * Innovation Draft
 * -------------------------------------------------------
 */

export async function generateInnovationDraft(
  input: InnovationDraftPromptInput,
): Promise<InnovationDraftData> {
  const payload = await generateJson(
    innovationDraftPrompt(input),
  );

  const parsed =
    innovationDraftResponseSchema.parse(payload);

  return normalizeDraft(
    parsed.data,
    input.githubUrl,
  );
}

/**
 * -------------------------------------------------------
 * Bounty Submission Analysis
 * -------------------------------------------------------
 */

export async function analyzeBountySubmission(
  input: BountySubmissionAnalysisInput,
): Promise<BountySubmissionAnalysisData> {
  const payload = await generateJson(
    bountySubmissionAnalysisPrompt(input),
  );

  const parsed =
    bountySubmissionAnalysisResponseSchema.parse(payload);

  return parsed.data;
}