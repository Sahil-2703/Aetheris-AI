"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  refreshCloudHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");

  // 1. Fetch user ID from session or profile endpoint for robust multi-browser isolation
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
      if (!session) {
        setCurrentUserId("guest");
      }
    }

    resolveUser();
  }, [session]);

  // 2. Load threads from local storage first for zero-latency UI
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

    const initial = getInitialUserThread();
    setThreads(initial);
    setActiveThreadId(initial[0].id);
  }, [currentUserId]);

  // 3. Fetch persistent conversation history from Supabase content_generations table
  const refreshCloudHistory = useCallback(async () => {
    if (!currentUserId || currentUserId === "guest") return;

    try {
      const res = await fetch("/api/ai/history");
      if (!res.ok) return;
      const data = await res.json();
      const generations = data.generations;

      if (Array.isArray(generations) && generations.length > 0) {
        const threadMap = new Map<string, { role: string; messages: ChatMessage[] }>();

        generations.forEach((gen: any) => {
          let promptText = gen.prompt_input || "";
          let extractedMode = gen.type || "general";
          let extractedThreadId: string | null = null;

          // Parse [THREAD:<id>] metadata prefix if present
          const threadMatch = promptText.match(/\[THREAD:([^\]]+)\]/);
          if (threadMatch) {
            extractedThreadId = threadMatch[1];
            promptText = promptText.replace(/\[THREAD:[^\]]+\]\s*/, "");
          }

          // Parse [MODE:<mode>] metadata prefix if present
          const modeMatch = promptText.match(/^\[MODE:([^\]]+)\]\s*([\s\S]*)/);
          if (modeMatch) {
            extractedMode = modeMatch[1];
            promptText = modeMatch[2];
          }

          // Thread ID assignment: use explicit thread ID if saved; fallback to mode for legacy records
          const threadId = extractedThreadId || `cloud-thread-${extractedMode}`;

          if (!threadMap.has(threadId)) {
            threadMap.set(threadId, { role: extractedMode, messages: [] });
          }
          const threadObj = threadMap.get(threadId)!;
          const timeStr = gen.created_at
            ? new Date(gen.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Recently";

          threadObj.messages.push({
            id: `db-${gen.id}-u`,
            role: "user",
            content: promptText.trim(),
            timestamp: timeStr,
          });
          threadObj.messages.push({
            id: `db-${gen.id}-a`,
            role: "assistant",
            content: gen.output,
            timestamp: timeStr,
          });
        });

        const cloudThreads: ConversationThread[] = [];
        threadMap.forEach((dataObj, threadId) => {
          const firstUserMsg = dataObj.messages.find((m) => m.role === "user");
          const defaultTitle = firstUserMsg
            ? firstUserMsg.content.length > 28
              ? `${firstUserMsg.content.slice(0, 28)}...`
              : firstUserMsg.content
            : `${dataObj.role.toUpperCase()} SESSION`;

          cloudThreads.push({
            id: threadId,
            title: defaultTitle,
            role: dataObj.role,
            updatedAt: "Cloud Synced",
            modeId: dataObj.role,
            messages: dataObj.messages,
          });
        });

        if (cloudThreads.length > 0) {
          setThreads((existingThreads) => {
            const merged = [...existingThreads];
            cloudThreads.forEach((ct) => {
              // Match strictly by thread ID!
              const matchIdx = merged.findIndex((et) => et.id === ct.id);
              if (matchIdx >= 0) {
                const existingMsgIds = new Set(merged[matchIdx].messages.map((m) => m.id));
                const existingContents = new Set(
                  merged[matchIdx].messages.map((m) => `${m.role}::${m.content.trim()}`)
                );

                const newMsgs = ct.messages.filter(
                  (m) =>
                    !existingMsgIds.has(m.id) &&
                    !existingContents.has(`${m.role}::${m.content.trim()}`)
                );

                merged[matchIdx] = {
                  ...merged[matchIdx],
                  title:
                    merged[matchIdx].title === "New Conversation" ||
                    merged[matchIdx].title === "Current Active Session"
                      ? ct.title
                      : merged[matchIdx].title,
                  messages: [...merged[matchIdx].messages, ...newMsgs],
                };
              } else {
                merged.push(ct);
              }
            });
            return merged;
          });

          // Focus active thread on first thread if current active thread is empty or invalid
          setActiveThreadId((prevActive) => {
            if (!prevActive) {
              return cloudThreads[0].id;
            }
            return prevActive;
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync cloud conversation history from Supabase:", err);
    }
  }, [currentUserId]);

  // 4. Sync cloud history on mount, window focus, tab visibility, and custom sync events
  useEffect(() => {
    if (!currentUserId || currentUserId === "guest") return;

    refreshCloudHistory();

    const handleFocus = () => refreshCloudHistory();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshCloudHistory();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("aetheris:sync-threads", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("aetheris:sync-threads", handleFocus);
    };
  }, [currentUserId, refreshCloudHistory]);

  // 5. Persist threads to local storage
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aetheris:sync-threads"));
    }
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
        refreshCloudHistory,
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
