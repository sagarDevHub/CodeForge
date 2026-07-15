import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credits, plan, paymentId } = await req.json();

    // Update user credits
    const user = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
    });

    // Log the transaction
    await db.transaction.create({
      data: {
        userId,
        plan,
        credits,
        paymentId,
        type: "subscription",
      },
    });

    return NextResponse.json({
      success: true,
      creditsAdded: credits,
      totalCredits: user.credits,
    });
  } catch (error) {
    console.error("Error updating credits:", error);
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 },
    );
  }
}
