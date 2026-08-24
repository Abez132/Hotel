import prisma, { withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// DELETE /api/entries/clear — wipe all entries for the authenticated user
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await withRetry(() =>
      prisma.entry.deleteMany({
        where: { userId: session.user.id },
      }),
    );
    return Response.json({
      message: "All entries cleared",
      count: result.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { message: "Failed to clear entries", error: message },
      { status: 500 },
    );
  }
}
