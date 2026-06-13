import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "../ai/groq";
import { checkGroqLimit } from "../security/ratelimit/groq-gurard";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = `https://github.com/sagarDevHub/Learning-git`;

type Responses = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Responses[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error(`Invalid github url`);
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit?.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url || null,
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pullCommits = async (projectId: string, userId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaries: string[] = [];
  for (const commit of unprocessedCommits) {
    try {
      await checkGroqLimit(userId);
      console.log(`Summarising ${commit.commitHash}`);
      const summary = await summariseCommit(githubUrl, commit.commitHash);
      summaries.push(summary);
    } catch (error) {
      console.error(`Failed to summarise ${commit.commitHash}:`, error);
    }
  }

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commit ${index}`);
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
      };
    }),
  });
  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  // get .diff data and pass it to Gemini AI to summarize
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: `application/vnd.github.v3.diff`,
    },
  });

  const MAX_DIFF_SIZE = 5000;

  const truncatedDiff =
    typeof data === "string" ? data.slice(0, MAX_DIFF_SIZE) : "";

  if (!truncatedDiff.trim()) {
    return "No meaningfull code changes detected.";
  }

  return await aiSummariseCommit(truncatedDiff);
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error(`Project has no Github URL`);
  }
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Responses[],
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  const unProcessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommits) => processedCommits.commitHash === commit.commitHash,
      ),
  );

  return unProcessedCommits;
}
