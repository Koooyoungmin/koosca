"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User } from "lucide-react";

interface Message {
  id: string;
  sender: "student" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
}

const STORAGE_KEY = "koosca-chat-messages";

// 데모용 학생 목록
const DEMO_STUDENTS = [
  { id: "s1", name: "김민준", grade: "고3", status: "학습중" },
  { id: "s2", name: "이서연", grade: "고2", status: "외출" },
  { id: "s3", name: "박지호", grade: "고1", status: "학습중" },
  { id: "s4", name: "최수아", grade: "고3", status: "하원" },
];

function formatTime(ts: string) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  return `${ampm} ${h % 12 === 0 ? 12 : h % 12}:${m}`;
}

export default function AdminChatPage() {
  const [selectedStudent, setSelectedStudent] = useState(DEMO_STUDENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const welcome: Message[] = [
        {
          id: "init-1",
          sender: "admin",
          senderName: "관리자",
          text: "안녕하세요! 궁금한 점이 있으면 언제든지 메시지 남겨주세요 😊",
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(welcome);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
    }
  }, [selectedStudent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "admin",
      senderName: "관리자",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const unreadCount = messages.filter((m) => m.sender === "student").length;

  return (
    <div className="flex h-screen max-h-screen bg-brand-50">
      {/* 학생 목록 사이드 패널 */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-brand-100 flex flex-col">
        <div className="px-4 py-4 border-b border-brand-100">
          <h2 className="font-serif text-base font-semibold text-brand-900">학생 채팅</h2>
          <p className="text-xs text-brand-400 mt-0.5">학생을 선택하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {DEMO_STUDENTS.map((student) => {
            const isSelected = selectedStudent.id === student.id;
            const statusColor =
              student.status === "학습중"
                ? "bg-green-400"
                : student.status === "외출"
                ? "bg-yellow-400"
                : "bg-brand-200";
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? "bg-brand-50 border-r-2 border-brand-900" : "hover:bg-brand-50"
                }`}
              >
                <div className="relative">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100">
                    <User className="w-4 h-4 text-brand-600" />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${statusColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-900 truncate">{student.name}</p>
                  <p className="text-xs text-brand-400">{student.grade} · {student.status}</p>
                </div>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-brand-900 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* 헤더 */}
        <div className="bg-white border-b border-brand-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100">
            <User className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-brand-900">
              {selectedStudent.name}
            </h1>
            <p className="text-xs text-brand-400">
              {selectedStudent.grade} · {selectedStudent.status}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-400" />
            <span className="text-xs text-brand-400">메시지 {unreadCount}개</span>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender === "admin";
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
                <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && (
                    <span className="text-xs text-brand-400 px-1">{selectedStudent.name}</span>
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
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
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
      </div>
    </div>
  );
}
