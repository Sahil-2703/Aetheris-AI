"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "@/lib/auth/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationThread {
  id: string;
  title: string;
  role: string;
  updatedAt: string;
  messages: ChatMessage[];
  modeId: string;
}

function filterDummyMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.filter(
    (msg) =>
      !msg.content.includes("Aetheris AI Decision Core ready") &&
      !msg.content.includes("Neural Decision Core initialized")
  );
}

function getInitialUserThread(): ConversationThread[] {
  return [
    {
      id: `thread-${Date.now()}`,
      title: "Current Active Session",
      role: "general",
      updatedAt: "Just now",
      modeId: "general",
      messages: [],
    },
  ];
}

interface ChatContextType {
  threads: ConversationThread[];
  activeThreadId: string;
  activeThread: ConversationThread;
  currentUserId: string | null;
  selectThread: (threadId: string) => void;
  createNewThread: () => void;
  deleteThread: (threadId: string, e?: React.MouseEvent) => void;
  appendMessageToActiveThread: (prompt: string, output: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");

  // 1. Fetch user ID from session or profile endpoint for robust isolation
  useEffect(() => {
    async function resolveUser() {
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        return;
      }

      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.id) {
            setCurrentUserId(data.user.id);
            return;
          }
        }
      } catch (err) {
        // Guest mode fallback
      }
      setCurrentUserId("guest");
    }

    resolveUser();
  }, [session]);

  // 2. Load threads scoped strictly to currentUserId
  useEffect(() => {
    if (!currentUserId) return;

    const storageKey = `aetheris_threads_${currentUserId}`;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((t) => ({
            ...t,
            messages: filterDummyMessages(t.messages),
          }));
          setThreads(cleaned);
          setActiveThreadId(cleaned[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load user threads from storage:", e);
    }

    // Default fresh session for this user
    const initial = getInitialUserThread();
    setThreads(initial);
    setActiveThreadId(initial[0].id);
  }, [currentUserId]);

  // 3. Persist threads scoped strictly to currentUserId
  useEffect(() => {
    if (!currentUserId || threads.length === 0) return;
    const storageKey = `aetheris_threads_${currentUserId}`;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(threads));
      }
    } catch (e) {
      console.error("Failed to save user threads to storage:", e);
    }
  }, [threads, currentUserId]);

  const rawActiveThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Guaranteed safe activeThread instance without dummy messages
  const activeThread: ConversationThread = rawActiveThread
    ? {
        ...rawActiveThread,
        messages: filterDummyMessages(rawActiveThread.messages),
      }
    : {
        id: "default-active",
        title: "Active Workspace",
        role: "general",
        updatedAt: "Just now",
        modeId: "general",
        messages: [],
      };

  const selectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const createNewThread = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ConversationThread = {
      id: newThreadId,
      title: "New Conversation",
      role: "general",
      updatedAt: "Just now",
      modeId: "general",
      messages: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
  };

  const deleteThread = (threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== threadId);
      if (activeThreadId === threadId && remaining.length > 0) {
        setActiveThreadId(remaining[0].id);
      }
      return remaining;
    });
  };

  const appendMessageToActiveThread = (userPrompt: string, aiOutput: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === (activeThreadId || activeThread.id)) {
          const userMsg: ChatMessage = {
            id: `msg-${Date.now()}-u`,
            role: "user",
            content: userPrompt,
            timestamp: "Just now",
          };
          const aiMsg: ChatMessage = {
            id: `msg-${Date.now()}-a`,
            role: "assistant",
            content: aiOutput,
            timestamp: "Just now",
          };

          const newTitle =
            t.title === "New Conversation" || t.title === "Current Active Session"
              ? userPrompt.length > 28
                ? `${userPrompt.slice(0, 28)}...`
                : userPrompt
              : t.title;

          const existingMessages = filterDummyMessages(t.messages);

          return {
            ...t,
            title: newTitle,
            updatedAt: "Just now",
            messages: [...existingMessages, userMsg, aiMsg],
          };
        }
        return t;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        activeThreadId,
        activeThread,
        currentUserId,
        selectThread,
        createNewThread,
        deleteThread,
        appendMessageToActiveThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
