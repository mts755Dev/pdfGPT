import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (req: Request) => {
  const { chatId } = await req.json();

  await db.delete(messages).where(eq(messages.chatId, chatId));

  return NextResponse.json({ message: "Chat reset successfully." });
};
