"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: "student" | "admin";
  sender_name: string;
  text: string;
  created_at: string;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  return `${ampm} ${h % 12 === 0 ? 12 : h % 12}:${m}`;
}

export default function AdminChatPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 초기 데이터 로드
  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      setCurrentUser(user);

      // 학생 목록 불러오기
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const studentList = data || [];
      setStudents(studentList);

      if (studentList.length > 0) {
        setSelectedStudent(studentList[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 학생 선택 시 메시지 로드
  useEffect(() => {
    if (selectedStudent && currentUser) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedStudent]);

  async function loadMessages() {
    if (!selectedStudent || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${selectedStudent.id},receiver_id.eq.${currentUser.id}),and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedStudent.id})`
        )
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
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
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === selectedStudent?.id &&
                newMsg.receiver_id === currentUser?.id) ||
              (newMsg.sender_id === currentUser?.id &&
                newMsg.receiver_id === selectedStudent?.id)
            ) {
              setMessages((prev) => [...prev, newMsg]);
            }
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
    if (!input.trim() || !selectedStudent || !currentUser) return;

    try {
      const newMsg = {
        sender_id: currentUser.id,
        receiver_id: selectedStudent.id,
        sender_role: "admin",
        sender_name: currentUser.user_metadata?.name || "관리자",
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
      <main className="flex-1 flex">
        {/* 학생 목록 사이드 패널 */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-brand-100 flex flex-col">
          <div className="px-4 py-4 border-b border-brand-100">
            <h2 className="font-serif text-base font-semibold text-brand-900">학생 채팅</h2>
            <p className="text-xs text-brand-400 mt-0.5">학생을 선택하세요</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {students.length === 0 ? (
              <div className="p-4 text-center text-brand-400 text-xs">
                등록된 학생이 없습니다.
              </div>
            ) : (
              students.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? "bg-brand-50 border-r-2 border-brand-900" : "hover:bg-brand-50"
                    }`}
                  >
                    <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand-100">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-900 truncate">{student.name}</p>
                      <p className="text-xs text-brand-400 truncate">{student.email}</p>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-brand-900 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedStudent ? (
            <>
              {/* 헤더 */}
              <div className="bg-white border-b border-brand-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h1 className="font-serif text-lg font-semibold text-brand-900">
                    {selectedStudent.name}
                  </h1>
                  <p className="text-xs text-brand-400">{selectedStudent.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-brand-400">메시지 {messages.length}개</span>
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
                    아직 메시지가 없습니다.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isMe && (
                          <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
                            {selectedStudent.name[0]}
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-1 max-w-[70%] ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          {!isMe && (
                            <span className="text-xs text-brand-400 px-1">
                              {selectedStudent.name}
                            </span>
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
                    placeholder={`${selectedStudent.name}에게 메시지 전송... (Enter로 전송)`}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-brand-400">
              <p>학생을 선택해주세요</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
