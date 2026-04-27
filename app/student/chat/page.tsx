"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "student" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
}

const STORAGE_KEY = "koosca-chat-messages";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  // localStorage에서 메시지 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // 초기 환영 메시지
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
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "student",
      senderName: "학생",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput("");

    // 데모: 3초 후 관리자 자동 응답
    setTimeout(() => {
      const autoReplies = [
        "네, 확인했습니다! 조금만 기다려 주세요.",
        "알겠습니다. 선생님께 전달할게요.",
        "네! 오늘도 열심히 공부하고 있네요 👍",
        "궁금한 점은 언제든지 물어보세요.",
        "확인 후 답변 드리겠습니다.",
      ];
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "admin",
        senderName: "관리자",
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        timestamp: new Date().toISOString(),
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withReply));
    }, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-brand-50">
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
        {messages.map((msg) => {
          const isMe = msg.sender === "student";
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
                  <span className="text-xs text-brand-400 px-1">{msg.senderName}</span>
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
    </div>
  );
}
