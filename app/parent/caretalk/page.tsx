"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: "parent" | "admin";
  text: string;
  time: string;
}

const INITIAL: Message[] = [
  { id: "1", sender: "admin", text: "안녕하세요! 구영민必학원 독서실입니다. 궁금한 사항이 있으시면 언제든지 문의해 주세요.", time: "09:00" },
  { id: "2", sender: "admin", text: "오늘 민준이가 오전 9시에 등원했습니다. 현재 수학 공부 중입니다 😊", time: "09:05" },
  { id: "3", sender: "parent", text: "감사합니다! 오늘 몇 시에 하원 예정인가요?", time: "10:30" },
  { id: "4", sender: "admin", text: "오늘은 오후 6시 하원 예정입니다. 학습 상황이 좋아서 오늘 목표 달성할 것 같아요!", time: "10:32" },
];

export default function CaretalkPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    setMessages([...messages, { id: Date.now().toString(), sender: "parent", text: input, time: now }]);
    setInput("");

    // 자동 응답 (데모)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "admin",
          text: "메시지를 확인했습니다. 곧 답변 드리겠습니다.",
          time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* 헤더 */}
      <div className="px-6 py-4 bg-white border-b border-brand-100 flex-shrink-0">
        <h1 className="font-serif text-xl font-bold text-brand-900">케어톡</h1>
        <p className="text-xs text-brand-500">구영민必학원 독서실 관리자</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs lg:max-w-md ${msg.sender === "parent" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {msg.sender === "admin" && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-serif">必</span>
                  <span className="text-xs text-brand-500">관리자</span>
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "parent"
                    ? "bg-brand-900 text-white rounded-br-sm"
                    : "bg-white border border-brand-100 text-brand-800 rounded-bl-sm shadow-soft"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-xs text-brand-300">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 py-4 bg-white border-t border-brand-100 flex-shrink-0 pb-safe">
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
            className="w-12 h-12 rounded-xl bg-brand-900 text-white flex items-center justify-center hover:bg-brand-800 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
