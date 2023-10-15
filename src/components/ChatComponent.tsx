"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleResetClick = async () => {
    await axios.post("/api/reset-chat", { chatId });
    await refetch();
  };

  return (
    <div className="relative h-screen overflow-scroll" id="message-container">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 border-gray border bg-white h-fit flex justify-between items-center">
        <h3 className="text-xl font-bold">Chat</h3>
        <div className="flex items-center ml-auto">
          <div className="relative group mx-2">
            <button onClick={handleResetClick}>
              <RotateCcw className="w-5 h-5 text-black-500" />
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-max px-1 py-1 bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* message list */}
      <div className="py-2">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-4 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
