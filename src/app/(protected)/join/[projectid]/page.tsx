import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

const JoinHandler = async ({ params }: Props) => {
  const { projectId } = await params;

  if (!projectId) {
    return redirect("/dashboard");
  }

  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const existingUser = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    await db.user.create({
      data: {
        id: userId,
        emailAddress: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
    });
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    return redirect("/dashboard");
  }

  const existingMembership = await db.userToProject.findFirst({
    where: {
      userId,
      projectId,
    },
  });

  if (!existingMembership) {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  }

  return redirect(`/dashboard`);
};

export default JoinHandler;
