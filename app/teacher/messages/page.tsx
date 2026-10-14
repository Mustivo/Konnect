"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ArrowDownToLine, FileText, MoreHorizontal, Paperclip, Search, Send, SquarePen, X } from "lucide-react";

type ChatMessage = {
  id: string;
  from: "student" | "teacher";
  text?: string;
  time: string;
  read?: boolean;
  attachment?: { name: string; details: string };
};

type Conversation = {
  id: string;
  name: string;
  initials: string;
  className: string;
  preview: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

const initialConversations: Conversation[] = [
  {
    id: "ethan",
    name: "Ethan Brown",
    initials: "EB",
    className: "Algebra I · Grade 9 · Class A",
    preview: "Thank you! I’ll bring my working.",
    time: "10:24",
    unread: 1,
    messages: [
      { id: "e1", from: "student", text: "Hi Miss Francis, I’m still getting stuck when the equation has brackets. Could you help me understand what I missed in the quiz?", time: "10:12" },
      { id: "e2", from: "teacher", text: "Of course, Ethan. You’ve got the first step right. Remember to multiply every term inside the brackets before moving terms across.", time: "10:15", read: true },
      { id: "e3", from: "teacher", attachment: { name: "Equations with Brackets · worked examples.pdf", details: "4 pages · 420 KB" }, time: "10:17", read: true },
      { id: "e4", from: "teacher", text: "Try the first two examples before Wednesday’s lesson. We can look at your working together at 08:50, just before class.", time: "10:20", read: true },
      { id: "e5", from: "student", text: "Thank you! I’ll bring my working. I think I forgot to multiply the second term by 3.", time: "10:24" },
    ],
  },
  { id: "mia", name: "Mia Davis", initials: "MD", className: "Algebra I · Grade 9 · Class A", preview: "Could we go through question 4?", time: "10:18", unread: 1, messages: [{ id: "m1", from: "student", text: "Could we go through question 4 together before class?", time: "10:18" }] },
  { id: "oliver", name: "Oliver James", initials: "OJ", className: "Algebra I · Grade 9 · Class A", preview: "The practice sheet really helped.", time: "09:48", unread: 0, messages: [{ id: "o1", from: "student", text: "The practice sheet really helped, thank you!", time: "09:48" }] },
  { id: "lilly", name: "Lilly Paul", initials: "LP", className: "Algebra I · Grade 9 · Class A", preview: "I’ve submitted my homework.", time: "Yesterday", unread: 0, messages: [{ id: "l1", from: "student", text: "I’ve submitted my homework.", time: "Yesterday" }] },
  { id: "david", name: "David Peter", initials: "DP", className: "Algebra I · Grade 9 · Class A", preview: "Thanks for the feedback, Miss.", time: "Yesterday", unread: 0, messages: [{ id: "d1", from: "student", text: "Thanks for the feedback, Miss.", time: "Yesterday" }] },
  { id: "emma", name: "Emma Wilson", initials: "EW", className: "Algebra I · Grade 9 · Class A", preview: "Is the unit test next Monday?", time: "12 Oct", unread: 0, messages: [{ id: "em1", from: "student", text: "Is the unit test next Monday?", time: "12 Oct" }] },
  { id: "noah", name: "Noah Williams", initials: "NW", className: "Algebra I · Grade 9 · Class A", preview: "I’ll catch up on the missed notes.", time: "12 Oct", unread: 0, messages: [{ id: "n1", from: "student", text: "I’ll catch up on the missed notes.", time: "12 Oct" }] },
];

function Avatar({ initials }: { initials: string }) {
  return <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[8px] font-bold text-[#405b35]">{initials}</span>;
}

export default function TeacherMessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState("ethan");
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeStudent, setComposeStudent] = useState("mia");
  const [composeText, setComposeText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);
  const visibleConversations = useMemo(() => conversations.filter((conversation) => {
    const matchesQuery = `${conversation.name} ${conversation.className} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!unreadOnly || conversation.unread > 0);
  }), [conversations, query, unreadOnly]);

  function openConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, unread: 0 } : item));
  }

  function appendMessage(conversationId: string, text: string, file?: File | null) {
    const cleanText = text.trim();
    if (!cleanText && !file) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? {
      ...conversation,
      preview: cleanText || `Attached ${file?.name}`,
      time,
      unread: 0,
      messages: [...conversation.messages, {
        id: `${conversationId}-${Date.now()}`,
        from: "teacher",
        text: cleanText || undefined,
        time,
        read: false,
        attachment: file ? { name: file.name, details: `${Math.max(1, Math.round(file.size / 1024))} KB` } : undefined,
      }],
    } : conversation));
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    appendMessage(activeId, draft, attachment);
    setDraft("");
    setAttachment(null);
  }

  function startConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composeText.trim()) return;
    setActiveId(composeStudent);
    appendMessage(composeStudent, composeText);
    setConversations((current) => current.map((conversation) => conversation.id === composeStudent ? { ...conversation, unread: 0 } : conversation));
    setDraft("");
    setComposeText("");
    setComposeOpen(false);
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3 py-1">
        <header>
          <h1 className="text-[20px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">Messages</h1>
          <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">A connected classroom starts with a conversation.</p>
        </header>

        <section className="grid h-[min(660px,calc(100dvh-175px))] min-h-0 min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-[#e3e8df] bg-white shadow-[0_2px_8px_rgba(35,49,28,0.04)] md:grid-cols-[230px_minmax(0,1fr)]" aria-label="Teacher messages">
          <aside className="flex min-h-0 flex-col border-b border-[#edf0e9] md:border-b-0 md:border-r">
            <div className="space-y-2.5 p-3">
              <div className="flex items-center justify-between gap-2"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Inbox</h2><span className="rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">{unreadCount} unread</span></div>
              <label className="relative block"><Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#899486]" /><span className="sr-only">Search conversations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations..." className="h-8 w-full rounded-full border border-[#e3e8df] bg-white pl-8 pr-3 text-[8px] text-[#30392d] outline-none placeholder:text-[#899486] focus:border-[#9caf91] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label>
              <div className="flex items-center gap-1" role="tablist" aria-label="Conversation filter"><button type="button" role="tab" aria-selected={!unreadOnly} onClick={() => setUnreadOnly(false)} className={`rounded-full px-2.5 py-1.5 text-[7px] font-semibold ${!unreadOnly ? "bg-[#e5f0df] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]" : "text-[#677362] hover:bg-[#f1f4ed] dark:text-[#a8b39f]"}`}>All messages</button><button type="button" role="tab" aria-selected={unreadOnly} onClick={() => setUnreadOnly(true)} className={`rounded-full px-2.5 py-1.5 text-[7px] font-semibold ${unreadOnly ? "bg-[#e5f0df] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]" : "text-[#677362] hover:bg-[#f1f4ed] dark:text-[#a8b39f]"}`}>Unread</button></div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Student conversations">
              {visibleConversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => openConversation(conversation)} aria-current={activeId === conversation.id ? "true" : undefined} className={`flex w-full items-start gap-2 border-b border-[#f0f2ee] px-3 py-2.5 text-left transition-colors dark:border-[#2a312a] ${activeId === conversation.id ? "bg-[#e8f1e3] dark:bg-[#263521]" : "hover:bg-[#f7f9f5] dark:hover:bg-[#202720]"}`}>
                <Avatar initials={conversation.initials} />
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[8px] font-bold text-[#273124] dark:text-[#e5ebdf]">{conversation.name}</span><span className="shrink-0 text-[6px] text-[#899486]">{conversation.time}</span></span><span className="mt-0.5 block truncate text-[7px] text-[#65715f] dark:text-[#a8b39f]">{conversation.preview}</span><span className="mt-0.5 block truncate text-[6px] text-[#899486]">{conversation.className.split(" · ")[0]}</span></span>
                {conversation.unread > 0 && <span className="mt-5 grid size-4 shrink-0 place-items-center rounded-full bg-[#e5f0df] text-[7px] font-bold text-[#405b35] dark:bg-[#354a30] dark:text-[#d6e6cb]">{conversation.unread}</span>}
              </button>)}
              {!visibleConversations.length && <p className="px-3 py-8 text-center text-[8px] text-[#788173]">No conversations found.</p>}
            </nav>

            <div className="shrink-0 border-t border-[#edf0e9] p-3 dark:border-[#2a312a]"><button type="button" onClick={() => setComposeOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white hover:bg-[#304d2b]"><SquarePen size={12} /> New message</button></div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col" aria-label={`Conversation with ${activeConversation.name}`}>
            <header className="flex min-h-[52px] shrink-0 items-center justify-between gap-2 border-b border-[#edf0e9] px-3 py-2.5 sm:px-4 dark:border-[#2a312a]">
              <div className="flex min-w-0 items-center gap-2"><Avatar initials={activeConversation.initials} /><div className="min-w-0"><h2 className="truncate text-[9px] font-bold text-[#273124] dark:text-[#e5ebdf]">{activeConversation.name}</h2><p className="truncate text-[7px] text-[#788173] dark:text-[#9aa592]">{activeConversation.className}</p></div></div>
              <div className="flex shrink-0 items-center gap-1"><Link href="/teacher/dashboard#students" className="rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#45543f] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">View student</Link><button type="button" aria-label="More conversation options" className="grid size-7 place-items-center rounded-full text-[#63715e] hover:bg-[#f1f4ed] dark:text-[#a8b39f]"><MoreHorizontal size={14} /></button></div>
            </header>

            <div className="message-history-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-white px-3 py-3 sm:px-4 dark:bg-[#161b17]">
              <p className="pb-1 text-center text-[7px] text-[#7d8979] dark:text-[#9aa592]">Today · 13 October 2026</p>
              {activeConversation.messages.map((message) => {
                const own = message.from === "teacher";
                return <div key={message.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[82%] rounded-xl px-3 py-2 ${own ? "bg-[#e4efdf] dark:bg-[#293a25]" : "bg-[#f1f4ee] dark:bg-[#202720]"}`}>
                    {message.text && <p className="text-[8px] leading-[1.5] text-[#34402f] dark:text-[#e1e8dc]">{message.text}</p>}
                    {message.attachment && <div className="flex items-center gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#dce8d7] text-[#405b35] dark:bg-[#354a30] dark:text-[#c5d6b8]"><FileText size={13} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[8px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{message.attachment.name}</span><span className="block text-[6px] text-[#788173] dark:text-[#9aa592]">{message.attachment.details}</span></span><button type="button" aria-label={`Download ${message.attachment.name}`} className="grid size-6 shrink-0 place-items-center rounded-full text-[#64725e] hover:bg-white/70 dark:text-[#c5d6b8]"><ArrowDownToLine size={12} /></button></div>}
                  </div>
                  <p className={`mt-1 text-[6px] text-[#899486] ${own ? "text-right" : ""}`}>{message.time}{own && message.read ? " · Read" : ""}</p>
                </div>;
              })}
            </div>

            <form onSubmit={sendMessage} className="shrink-0 border-t border-[#edf0e9] bg-white p-3 sm:px-4 dark:border-[#2a312a] dark:bg-[#161b17]">
              {attachment && <div className="mb-2 flex items-center gap-2 rounded-md bg-[#f0f3ed] px-2 py-1.5 text-[7px] text-[#52624b] dark:bg-[#202720] dark:text-[#c5d6b8]"><Paperclip size={11} /><span className="min-w-0 flex-1 truncate">{attachment.name}</span><button type="button" aria-label="Remove attachment" onClick={() => { setAttachment(null); if (fileInput.current) fileInput.current.value = ""; }}><X size={11} /></button></div>}
              <label htmlFor="teacher-message-draft" className="sr-only">Write a message to {activeConversation.name}</label>
              <div className="flex min-h-10 items-center gap-2 rounded-xl bg-[#f0f3ed] px-2.5 dark:bg-[#202720]"><input ref={fileInput} type="file" className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} /><button type="button" aria-label="Attach a file" onClick={() => fileInput.current?.click()} className="grid size-7 shrink-0 place-items-center rounded-full text-[#68785d] hover:bg-white/70 dark:text-[#b9caa9]"><Paperclip size={14} /></button><textarea id="teacher-message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Write a message to ${activeConversation.name.split(" ")[0]}...`} rows={1} className="max-h-20 min-h-6 min-w-0 flex-1 resize-none bg-transparent py-1 text-[8px] text-[#394136] outline-none placeholder:text-[#76816f] dark:text-[#e1e8dc] dark:placeholder:text-[#9aa592]" /><button type="submit" disabled={!draft.trim() && !attachment} className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-[#233c20] px-3 text-[7px] font-semibold text-white hover:bg-[#304d2b] disabled:cursor-not-allowed disabled:opacity-45"><Send size={10} /> Send</button></div>
              <p className="mt-2 text-[6px] text-[#858e7d] dark:text-[#9aa592]">Only you and {activeConversation.name.split(" ")[0]} can see this conversation.</p>
            </form>
          </section>
        </section>

        {composeOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposeOpen(false); }}><form onSubmit={startConversation} className="w-full max-w-sm space-y-3 rounded-xl border border-[#e0e5dd] bg-white p-4 shadow-xl dark:border-[#2a312a] dark:bg-[#161b17]"><div className="flex items-center justify-between"><h2 className="text-[12px] font-bold text-[#273124] dark:text-[#e5ebdf]">New message</h2><button type="button" aria-label="Close new message" onClick={() => setComposeOpen(false)} className="grid size-7 place-items-center rounded-full hover:bg-[#f1f4ed]"><X size={14} /></button></div><label className="block space-y-1 text-[8px] font-semibold text-[#465341] dark:text-[#c5d6b8]">Student<select value={composeStudent} onChange={(event) => setComposeStudent(event.target.value)} className="h-8 w-full rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.name}</option>)}</select></label><label className="block space-y-1 text-[8px] font-semibold text-[#465341] dark:text-[#c5d6b8]">Message<textarea required value={composeText} onChange={(event) => setComposeText(event.target.value)} rows={4} className="w-full resize-y rounded-md border border-[#e0e5dd] bg-white p-2 text-[8px] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" placeholder="Write your message..." /></label><button type="submit" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white hover:bg-[#304d2b]"><Send size={11} /> Send message</button></form></div>}
      </div>
    </DashboardShell>
  );
}