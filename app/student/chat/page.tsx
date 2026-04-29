"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Message {
  id: string;
  sender_id: string;
  sender_role: "student" | "admin";
  sender_name: string;
  text: string;
  created_at: string;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  return `${ampm} ${h % 12 === 0 ? 12 : h % 12}:${m}`;
}

export default function StudentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 초기 데이터 로드 및 실시간 구독
  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, []);

  async function loadMessages() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      setCurrentUser(user);

      // 메시지 불러오기
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !currentUser) return;

    try {
      // 관리자 찾기 (첫 번째 관리자)
      const { data: adminData, error: adminError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      if (adminError || !adminData) {
        setError("관리자를 찾을 수 없습니다.");
        return;
      }

      const newMsg = {
        sender_id: currentUser.id,
        receiver_id: adminData.id,
        sender_role: "student",
        sender_name: currentUser.user_metadata?.name || "학생",
        text: input.trim(),
      };

      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert([newMsg]);

      if (insertError) throw insertError;

      setInput("");
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600">로딩 중...</p>
          </div>
          <BottomNav />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-brand-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900">
            <MessageCircle className="w-5 h-5 text-brand-50" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-brand-900">관리자와 대화</h1>
            <p className="text-xs text-brand-400">궁금한 점을 자유롭게 물어보세요</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-brand-400">온라인</span>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-brand-400 text-sm">
              아직 메시지가 없습니다. 관리자에게 메시지를 보내보세요!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* 아바타 */}
                  {!isMe && (
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-brand-900 text-xs font-semibold text-brand-50">
                      관
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-xs text-brand-400 px-1">{msg.sender_name}</span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMe
                          ? "bg-brand-900 text-brand-50 rounded-br-sm"
                          : "bg-white border border-brand-100 text-brand-800 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-brand-300 px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="bg-white border-t border-brand-100 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-brand-900 outline-none placeholder:text-brand-300"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-brand-900 text-brand-50 transition hover:bg-brand-800 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-brand-300">
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>
        </div>
      </main>
    </div>
  );
}
