/**
 * Lightweight read-only GitHub context fetcher used to ground the AI innovation
 * draft. Uses the public REST API (no auth required for public repos). Every
 * failure path returns null so callers can degrade gracefully to prompt-only
 * generation.
 */

const README_LIMIT = 6000;

type RepoRef = {
  readonly owner: string;
  readonly repo: string;
};

export type RepoContext = {
  readonly fullName: string;
  readonly description: string;
  readonly homepage?: string;
  readonly language?: string;
  readonly topics: readonly string[];
  readonly stars: number;
  readonly readmeExcerpt: string;
};

function parseRepoRef(githubUrl: string): RepoRef | null {
  try {
    const url = new URL(githubUrl);

    if (!url.hostname.toLowerCase().endsWith("github.com")) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);

    if (segments.length < 2) {
      return null;
    }

    return { owner: segments[0], repo: segments[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

const githubHeaders: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "OICE-App",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function fetchReadmeExcerpt(ref: RepoRef): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${ref.owner}/${ref.repo}/readme`, {
      headers: githubHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    const payload = (await response.json()) as { readonly content?: string; readonly encoding?: string };

    if (typeof payload.content !== "string") {
      return "";
    }

    const decoded =
      payload.encoding === "base64" ? Buffer.from(payload.content, "base64").toString("utf-8") : payload.content;

    return decoded.slice(0, README_LIMIT);
  } catch {
    return "";
  }
}

export async function fetchRepoContext(githubUrl: string): Promise<RepoContext | null> {
  const ref = parseRepoRef(githubUrl);

  if (!ref) {
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${ref.owner}/${ref.repo}`, {
      headers: githubHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const repo = (await response.json()) as {
      readonly full_name?: string;
      readonly description?: string | null;
      readonly homepage?: string | null;
      readonly language?: string | null;
      readonly topics?: readonly string[];
      readonly stargazers_count?: number;
    };

    const readmeExcerpt = await fetchReadmeExcerpt(ref);

    return {
      fullName: repo.full_name ?? `${ref.owner}/${ref.repo}`,
      description: repo.description ?? "",
      homepage: repo.homepage ? repo.homepage : undefined,
      language: repo.language ?? undefined,
      topics: Array.isArray(repo.topics) ? repo.topics : [],
      stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
      readmeExcerpt,
    };
  } catch {
    return null;
  }
}

/** Flattens repo metadata into a compact text block for the Gemini prompt. */
export function formatRepoContext(context: RepoContext): string {
  const lines = [
    `Repository: ${context.fullName}`,
    context.description ? `Description: ${context.description}` : null,
    context.language ? `Primary language: ${context.language}` : null,
    context.topics.length ? `Topics: ${context.topics.join(", ")}` : null,
    `Stars: ${context.stars}`,
    context.homepage ? `Homepage: ${context.homepage}` : null,
    context.readmeExcerpt ? `\nREADME excerpt:\n${context.readmeExcerpt}` : null,
  ];

  return lines.filter((line): line is string => Boolean(line)).join("\n");
}
