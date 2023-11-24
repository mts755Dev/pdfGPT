"use client";
import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { DrizzleChat, chats as chatsModel } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import axios from "axios";
import { eq } from "drizzle-orm";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = ({ params: { chatId } }: Props) => {
  const { userId } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [chats, setChats] = useState<DrizzleChat[]>();
  const [currentChat, setCurrentChat] = useState<DrizzleChat>();
  const router = useRouter();

  const fetchChats = useCallback(async () => {
    if (!userId) {
      return router.push("/sign-in");
    }
    const _chats = await db
      .select()
      .from(chatsModel)
      .where(eq(chatsModel.userId, userId));
    if (!_chats) {
      return router.push("/");
    }
    setCurrentChat(_chats.find((chat) => chat.id === parseInt(chatId)));
    setChats(_chats);
    setIsPro(await checkSubscription(userId));
  }, [chatId, router, userId]);

  useEffect(() => {
    fetchChats();
  }, [chats, fetchChats]);

  const handleDeleteClick = async (chatId: number) => {
    await axios.post("/api/delete-chat", { chatId });
    setChats((prevChats) => prevChats?.filter((chat) => chat.id !== chatId));
    toast.success("Chat deleted!");
    router.push("/");
  };

  return (
    <div className="flex max-h-screen overflow-hidden">
      <div className="flex w-full max-h-screen overflow-hidden">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar
            handleDeleteClick={handleDeleteClick}
            chats={chats}
            chatId={parseInt(chatId)}
            isPro={isPro}
          />
        </div>
        {/* pdf viewer */}
        {/* <div className="max-h-screen flex-[5]">
          <PDFViewer
            pdf_name={currentChat?.pdfName || ""}
            pdf_url={currentChat?.pdfUrl || ""}
          />
        </div> */}
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
