import { db } from "@/server/db";
import { answerQuestion } from "./groq";
import type {
  DetectedStack,
  MigrationSuggestion,
} from "../../app/(protected)/migration/types";

export async function detectTechStack(
  projectId: string,
): Promise<DetectedStack> {
  try {
    // Get project files
    const files = await db.sourceCodeEmbedding.findMany({
      where: { projectId },
      take: 30,
    });

    const fileContents = files.map((f) => f.sourceCode).join("\n");
    const fileNames = files.map((f) => f.fileName);

    // Try to find package.json first
    const packageJson = files.find((f) => f.fileName === "package.json");

    let pkg = null;
    if (packageJson) {
      try {
        pkg = JSON.parse(packageJson.sourceCode);
      } catch (e) {}
    }

    const prompt = `
You are a senior software architect. Analyze this codebase and detect the technology stack.

Files detected: ${fileNames.join(", ")}

${pkg ? `package.json dependencies: ${JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies }, null, 2)}` : ""}

Code samples:
${fileContents.slice(0, 3000)}

Identify:
1. Framework (e.g., React, Next.js, Vue, Angular, etc.)
2. Framework version
3. Language (e.g., JavaScript, TypeScript, Python, Java, etc.)
4. Bundler (e.g., Webpack, Vite, Parcel, etc.)
5. Database (e.g., PostgreSQL, MySQL, MongoDB, Prisma, etc.)
6. Authentication (e.g., Clerk, Auth0, Firebase, etc.)
7. UI Library (e.g., Tailwind, MaterialUI, Bootstrap, etc.)
8. State Management (e.g., Redux, Zustand, Context API, etc.)
9. Testing tools
10. Other detected technologies

Return as JSON with this exact structure:
{
  "framework": "string",
  "frameworkVersion": "string",
  "language": "string",
  "bundler": "string",
  "database": "string",
  "auth": "string",
  "ui": "string",
  "stateManagement": "string",
  "testing": ["string"],
  "otherDetected": ["string"],
  "confidence": 0-100
}
`;

    const response = await answerQuestion(prompt, "");
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const result = JSON.parse(jsonMatch[0]);

    return {
      framework: result.framework || "Unknown",
      frameworkVersion: result.frameworkVersion || "Unknown",
      language: result.language || "JavaScript",
      bundler: result.bundler || "Unknown",
      database: result.database || "Unknown",
      auth: result.auth || "Unknown",
      ui: result.ui || "Unknown",
      stateManagement: result.stateManagement || "Unknown",
      testing: result.testing || [],
      otherDetected: result.otherDetected || [],
      confidence: result.confidence || 50,
    };
  } catch (error) {
    console.error("Stack detection error:", error);
    return getFallbackStack();
  }
}

export async function analyzeProjectMigration(
  projectId: string,
  target: string,
  type: string,
): Promise<any> {
  // Get project files
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sourceCodeEmbeddings: { take: 30 },
      commits: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const files = project.sourceCodeEmbeddings.map((f) => ({
    name: f.fileName,
    summary: f.summary || "",
    code: f.sourceCode?.slice(0, 500) || "",
  }));

  const prompt = `
You are a senior software architect specializing in code migrations.

Project: ${project.name}
Target Migration: ${target}
Migration Type: ${type}

Current Codebase Analysis:
- Total Files: ${files.length}
- Key Files:
${files
  .slice(0, 10)
  .map((f) => `- ${f.name}: ${f.summary || "No summary"}`)
  .join("\n")}

Recent Commits:
${project.commits
  .slice(0, 5)
  .map((c) => `- ${c.commitMessage}`)
  .join("\n")}

Generate a migration plan with the following JSON structure:
{
  "summary": "Brief overview of the migration",
  "steps": [
    {
      "order": 1,
      "title": "Step title",
      "description": "Step description",
      "files": ["file1.ts", "file2.ts"],
      "commands": ["npm install something"]
    }
  ],
  "risks": [
    {
      "level": "medium",
      "description": "Risk description",
      "mitigation": "How to mitigate"
    }
  ],
  "estimatedTime": "2-3 hours",
  "files": ["file1.ts", "file2.ts"],
  "dependencies": [
    {
      "name": "package-name",
      "from": "1.0.0",
      "to": "2.0.0",
      "reason": "Upgrade reason"
    }
  ]
}

Return ONLY valid JSON, no other text.
`;

  try {
    const response = await answerQuestion(prompt, "");
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Ensure required fields
    return {
      summary: result.summary || `Migration to ${target}`,
      steps: result.steps || [],
      risks: result.risks || [],
      estimatedTime: result.estimatedTime || "4-6 hours",
      files: result.files || [],
      dependencies: result.dependencies || [],
    };
  } catch (error) {
    console.error("Migration analysis error:", error);
    return {
      summary: `Migration to ${target}`,
      steps: [
        {
          order: 1,
          title: "Review codebase",
          description: "Review the current codebase structure",
          files: ["package.json"],
          commands: ["npm outdated"],
        },
      ],
      risks: [
        {
          level: "medium",
          description: "Potential breaking changes",
          mitigation: "Test thoroughly after migration",
        },
      ],
      estimatedTime: "4-6 hours",
      files: [],
      dependencies: [],
    };
  }
}

function getFallbackStack(): DetectedStack {
  return {
    framework: "Unknown",
    frameworkVersion: "Unknown",
    language: "JavaScript",
    bundler: "Unknown",
    database: "Unknown",
    auth: "Unknown",
    ui: "Unknown",
    stateManagement: "Unknown",
    testing: [],
    otherDetected: [],
    confidence: 30,
  };
}

export async function getMigrationSuggestions(
  projectId: string,
  currentStack: DetectedStack,
): Promise<MigrationSuggestion[]> {
  try {
    const prompt = `
You are a senior software architect. Based on the current tech stack of a project, suggest the best migration paths.

Current Stack:
- Framework: ${currentStack.framework} (${currentStack.frameworkVersion})
- Language: ${currentStack.language}
- Bundler: ${currentStack.bundler}
- Database: ${currentStack.database}
- UI Library: ${currentStack.ui}
- State Management: ${currentStack.stateManagement}
- Auth: ${currentStack.auth}

Goal: Suggest realistic, modern migration paths that would improve the project.

Consider all possible migration paths:
1. Framework upgrades (e.g., Next.js 12 → 14, React 17 → 18, Vue 2 → 3)
2. Framework migrations (e.g., React → Next.js, Vue → React, Angular → Next.js)
3. Language migrations (e.g., JavaScript → TypeScript, Java → Kotlin)
4. Architecture changes (e.g., REST → GraphQL, Monolith → Microservices)
5. Tool migrations (e.g., Webpack → Vite, Jest → Vitest, Redux → Zustand)

Return at least 3-5 migration suggestions as a JSON array with:
- name: "string",
- description: "string",
- from: "string",
- to: "string",
- type: "framework" | "language" | "architecture" | "tool",
- complexity: "low" | "medium" | "high",
- benefits: ["string"],
- risks: ["string"],
- estimatedTime: "string",
- popularity: 0-100

Return ONLY the JSON array.
`;

    const response = await answerQuestion(prompt, "");
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");

    const suggestions = JSON.parse(jsonMatch[0]);

    // Ensure we have at least some suggestions
    if (!suggestions || suggestions.length === 0) {
      return getFallbackSuggestions(currentStack);
    }

    return suggestions;
  } catch (error) {
    console.error("Migration suggestions error:", error);
    return getFallbackSuggestions(currentStack);
  }
}

function getFallbackSuggestions(stack: DetectedStack): MigrationSuggestion[] {
  const suggestions: MigrationSuggestion[] = [];

  // Framework suggestions based on detected stack
  if (stack.framework === "React" || stack.framework === "Unknown") {
    suggestions.push({
      name: "Migrate to Next.js 14",
      description:
        "Upgrade from React to Next.js 14 with App Router for better performance and SEO",
      from: stack.framework === "React" ? "React" : "Current Framework",
      to: "Next.js 14",
      type: "framework",
      complexity: "medium",
      benefits: [
        "Server-side rendering (SSR)",
        "Static site generation (SSG)",
        "Built-in API routes",
        "File-based routing",
        "Better SEO",
        "Image optimization",
      ],
      risks: [
        "Learning curve for App Router",
        "Potential breaking changes",
        "Migration of existing routing",
      ],
      estimatedTime: "2-3 days",
      popularity: 95,
    });
  }

  if (stack.language === "JavaScript" || stack.language === "Unknown") {
    suggestions.push({
      name: "Add TypeScript",
      description:
        "Migrate from JavaScript to TypeScript for better type safety and developer experience",
      from: "JavaScript",
      to: "TypeScript",
      type: "language",
      complexity: "medium",
      benefits: [
        "Better type safety",
        "Improved IDE support",
        "Self-documenting code",
        "Better maintainability",
        "Fewer runtime errors",
      ],
      risks: [
        "Initial setup overhead",
        "Learning curve for the team",
        "Migration of existing code",
      ],
      estimatedTime: "1-2 days",
      popularity: 90,
    });
  }

  if (stack.bundler === "Webpack" || stack.bundler === "Unknown") {
    suggestions.push({
      name: "Switch to Vite",
      description:
        "Replace Webpack with Vite for faster builds and better developer experience",
      from: "Webpack",
      to: "Vite",
      type: "tool",
      complexity: "low",
      benefits: [
        "Faster build times",
        "Better Hot Module Replacement",
        "Smaller configuration",
        "Instant server start",
      ],
      risks: ["Plugin compatibility", "Migration of custom Webpack configs"],
      estimatedTime: "4-6 hours",
      popularity: 85,
    });
  }

  if (stack.ui === "Bootstrap" || stack.ui === "Unknown") {
    suggestions.push({
      name: "Upgrade to Tailwind CSS",
      description:
        "Migrate from Bootstrap to Tailwind CSS for better customization",
      from: "Bootstrap",
      to: "Tailwind CSS",
      type: "tool",
      complexity: "medium",
      benefits: [
        "More customization",
        "Smaller CSS bundle",
        "Utility-first approach",
        "Better dark mode support",
      ],
      risks: ["Complete UI rewrite", "Learning curve"],
      estimatedTime: "2-4 days",
      popularity: 80,
    });
  }

  if (stack.framework === "Vue") {
    suggestions.push({
      name: "Migrate to React",
      description: "Move from Vue to React for better ecosystem and job market",
      from: "Vue",
      to: "React",
      type: "framework",
      complexity: "high",
      benefits: [
        "Larger ecosystem",
        "More job opportunities",
        "Better tooling",
        "More community support",
      ],
      risks: ["Complete rewrite", "Learning curve", "Different paradigm"],
      estimatedTime: "1-2 weeks",
      popularity: 70,
    });
  }

  if (stack.framework === "Angular") {
    suggestions.push({
      name: "Migrate to Next.js",
      description:
        "Move from Angular to Next.js for better performance and modern features",
      from: "Angular",
      to: "Next.js",
      type: "framework",
      complexity: "high",
      benefits: [
        "Better performance",
        "Modern React ecosystem",
        "Built-in SSR",
        "Easier deployment",
      ],
      risks: ["Complete rewrite", "Different architecture", "Learning curve"],
      estimatedTime: "2-3 weeks",
      popularity: 75,
    });
  }

  return suggestions;
}
