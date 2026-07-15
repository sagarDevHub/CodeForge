import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 },
      );
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userToProjects: {
          some: { userId },
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        statusMessage: true,
        progress: true,
        createdAt: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project status:", error);
    return NextResponse.json(
      { error: "Failed to fetch project status" },
      { status: 500 },
    );
  }
}
