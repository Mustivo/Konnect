"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson, currentUser, getSessionChat, sendSessionChatMessage } from "@/lib/api";

type ApiChatMessage = {
  id?: string | number;
  message?: string;
  text?: string;
  content?: string;
  sender?: string | { id?: string | number; first_name?: string; last_name?: string; email?: string };
  sender_id?: string | number;
  sender_name?: string;
  created_at?: string;
  timestamp?: string;
  is_self?: boolean;
};

export type SessionChatMessage = {
  id: string;
  name: string;
  time: string;
  text: string;
  self: boolean;
};

type ChatPayload = ApiChatMessage[] | { results?: ApiChatMessage[]; messages?: ApiChatMessage[] };

function toMessages(payload: ChatPayload, userId: string, userName = "") {
  const records = Array.isArray(payload) ? payload : payload.results ?? payload.messages ?? [];
  return records.flatMap((record, index) => {
    const text = record.message ?? record.text ?? record.content;
    if (!text) return [];
    const sender = typeof record.sender === "object" ? record.sender : null;
    const senderName = record.sender_name
      || (typeof record.sender === "string" ? record.sender : "")
      || [sender?.first_name, sender?.last_name].filter(Boolean).join(" ")
      || sender?.email
      || "Class participant";
    const createdAt = record.created_at ?? record.timestamp;
    const date = createdAt ? new Date(createdAt) : null;
    const isSelf = record.is_self === true
      || (Boolean(userId) && String(sender?.id ?? record.sender_id ?? "") === userId)
      || (Boolean(userName) && senderName.toLowerCase() === userName.toLowerCase());

    return [{
      id: String(record.id ?? `${createdAt ?? "message"}-${index}`),
      name: senderName,
      time: date && Number.isFinite(date.getTime()) ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      text,
      self: isSelf,
    }];
  });
}

export function useSessionChat(sessionId: string) {
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);
  const userIdRef = useRef("");
  const userNameRef = useRef("");
  const activeRequestRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!sessionId || activeRequestRef.current) return;
    activeRequestRef.current = true;
    try {
      const payload = await apiJson<ChatPayload>(await getSessionChat(sessionId));
      setMessages(toMessages(payload, userIdRef.current, userNameRef.current));
      setChatError("");
    } catch {
      setChatError("Live chat is unavailable. Check your connection and try again.");
    } finally {
      activeRequestRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    let active = true;
    if (!sessionId) return;

    void currentUser().then((user) => {
      if (active) {
        userIdRef.current = String(user.id);
        userNameRef.current = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || user.username || "User";
      }
    }).catch(() => undefined);
    void refresh();

    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(`konnect-session-chat-${sessionId}`)
      : null;

    if (channel) {
      channel.onmessage = () => {
        void refresh();
      };
    }

    const interval = window.setInterval(() => void refresh(), 3000);
    return () => {
      active = false;
      channel?.close();
      window.clearInterval(interval);
    };
  }, [refresh, sessionId]);

  const send = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!sessionId || !cleanText || sending) return false;
    setSending(true);
    try {
      await apiJson(await sendSessionChatMessage(sessionId, {
        message: cleanText,
        sender_name: userNameRef.current || "User",
        sender_id: userIdRef.current || "1",
      }));
      await refresh();
      try {
        const channel = new BroadcastChannel(`konnect-session-chat-${sessionId}`);
        channel.postMessage({ type: "new-message" });
        channel.close();
      } catch {}
      setChatError("");
      return true;
    } catch {
      setChatError("Your message could not be sent. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, [refresh, sending, sessionId]);

  return { messages, chatError, sending, send, refresh };
}