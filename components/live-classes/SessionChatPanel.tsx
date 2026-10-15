"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useSessionChat } from "@/lib/useSessionChat";

export default function SessionChatPanel({ sessionId }: { sessionId: string }) {
  const { messages, chatError, sending, send } = useSessionChat(sessionId);
  const [draft, setDraft] = useState("");

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await send(draft)) setDraft("");
  }

  return (
    <section className="flex min-h-[320px] flex-col rounded-lg border border-[#e0e5dd] bg-white dark:border-[#2a312a] dark:bg-[#161b17]" aria-label="Live class conversation">
      <header className="border-b border-[#e9ede5] px-3 py-2.5 dark:border-[#293127]">
        <h2 className="text-[10px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Class conversation</h2>
        <p className="text-[7px] text-[#81897d] dark:text-[#99a391]">Messages are shared with everyone in this session.</p>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[7px] font-semibold ${message.self ? "text-[#4d633d] dark:text-[#c2d2b5]" : "text-[#343c30] dark:text-[#e1e8dc]"}`}>{message.name}</span>
              <time className="text-[6px] text-[#90978b]">{message.time}</time>
            </div>
            <p className={`rounded-md px-2 py-1.5 text-[8px] leading-relaxed ${message.self ? "bg-[#eaf0e3] text-[#3f4939] dark:bg-[#293522] dark:text-[#d5dfce]" : "bg-[#f3f4ef] text-[#50594b] dark:bg-[#20271e] dark:text-[#c1cbb9]"}`}>{message.text}</p>
          </article>
        ))}
        {!messages.length && !chatError && <p className="py-8 text-center text-[8px] text-[#788172]">No messages yet. Start the conversation.</p>}
        {chatError && <p role="status" className="py-2 text-[8px] text-[#a7463a] dark:text-[#f09a8e]">{chatError}</p>}
      </div>
      <form onSubmit={submitMessage} className="flex shrink-0 items-center gap-1.5 border-t border-[#e9ede5] p-2 dark:border-[#293127]">
        <label htmlFor="session-chat-message" className="sr-only">Write a class message</label>
        <input id="session-chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message your class..." className="h-8 min-w-0 flex-1 rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] outline-none placeholder:text-[#92998d] focus:border-[#9aab8c] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#edf1e9]" />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" title="Send message" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#263d21] text-white hover:bg-[#1c3019] disabled:cursor-not-allowed disabled:opacity-50"><Send size={12} /></button>
      </form>
    </section>
  );
}