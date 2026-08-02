import prisma, { withRetry } from "@/lib/db";

export const runtime = "nodejs";

// DELETE /api/entries/clear — wipe all entries
export async function DELETE() {
  try {
    const result = await withRetry(() => prisma.entry.deleteMany());
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
