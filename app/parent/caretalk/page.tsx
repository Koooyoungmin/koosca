"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: "parent" | "admin";
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

export default function CaretalkPage() {
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

      // 관리자 찾기
      const { data: adminData, error: adminError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      if (adminError || !adminData) {
        setError("관리자를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      // 메시지 불러오기
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${adminData.id}),and(sender_id.eq.${adminData.id},receiver_id.eq.${user.id})`
        )
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

  async function send() {
    if (!input.trim() || !currentUser) return;

    try {
      // 관리자 찾기
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
        sender_role: "parent",
        sender_name: currentUser.user_metadata?.name || "학부모",
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar role="parent" />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brand-600">로딩 중...</p>
          </div>
          <BottomNav role="parent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="parent" />
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 bg-white border-b border-brand-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 font-serif text-base font-semibold text-brand-50">
              必
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-brand-900">케어톡</h1>
              <p className="text-xs text-brand-500">구영민必학원 독서실 관리자</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-brand-400">온라인</span>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-50">
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
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    msg.sender_id === currentUser?.id ? "items-end" : "items-start"
                  } flex flex-col gap-1`}
                >
                  {msg.sender_id !== currentUser?.id && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-serif">
                        必
                      </span>
                      <span className="text-xs text-brand-500">관리자</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender_id === currentUser?.id
                        ? "bg-brand-900 text-white rounded-br-sm"
                        : "bg-white border border-brand-100 text-brand-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-brand-300">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="px-4 py-4 bg-white border-t border-brand-100 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-12 h-12 rounded-xl bg-brand-900 text-white flex items-center justify-center hover:bg-brand-800 transition-colors disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-brand-300">Enter로 전송</p>
        </div>
      </main>
    </div>
  );
}
