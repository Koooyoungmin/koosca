"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";

interface Message {
  id: string;
  sender: "parent" | "admin";
  text: string;
  time: string;
  timestamp: number;
}

// 학부모별 독립 storage key 생성
function getStorageKey(parentId: string) {
  return `koosca-caretalk-${parentId}`;
}

const DEMO_PARENTS = [
  { id: "p1", name: "김민준 학부모", childName: "김민준", grade: "고3", phone: "010-1234-5678" },
  { id: "p2", name: "이서연 학부모", childName: "이서연", grade: "고2", phone: "010-2345-6789" },
  { id: "p3", name: "박지호 학부모", childName: "박지호", grade: "고1", phone: "010-3456-7890" },
  { id: "p4", name: "최수아 학부모", childName: "최수아", grade: "고3", phone: "010-4567-8901" },
];

// 학부모별 초기 메시지 (각각 다른 내용)
function getInitialMessages(parentId: string, childName: string): Message[] {
  return [
    {
      id: `${parentId}-init-1`,
      sender: "admin",
      text: `안녕하세요! 구영민必학원 독서실입니다. ${childName} 학생 관련 문의사항이 있으시면 언제든지 연락주세요.`,
      time: "09:00",
      timestamp: Date.now() - 7200000,
    },
  ];
}

export default function AdminCaretalkPage() {
  const [selectedParent, setSelectedParent] = useState(DEMO_PARENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 선택된 학부모가 바뀔 때마다 해당 학부모의 채팅 불러오기
  useEffect(() => {
    const key = getStorageKey(selectedParent.id);

    const load = () => {
      const stored = localStorage.getItem(key);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const initial = getInitialMessages(selectedParent.id, selectedParent.childName);
        localStorage.setItem(key, JSON.stringify(initial));
        setMessages(initial);
      }
    };

    load();

    // 이전 인터벌 정리 후 새 인터벌 등록 (2초마다 학부모 측 메시지 동기화)
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(load, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedParent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    const key = getStorageKey(selectedParent.id);
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "admin",
      text: input.trim(),
      time: now,
      timestamp: Date.now(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // 각 학부모별 미읽은 메시지 수 계산
  function getUnreadCount(parentId: string) {
    const key = getStorageKey(parentId);
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const msgs: Message[] = JSON.parse(stored);
    return msgs.filter((m) => m.sender === "parent").length;
  }

  return (
    <div className="flex h-screen max-h-screen bg-brand-50">
      {/* 학부모 목록 패널 */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-brand-100 flex flex-col">
        <div className="px-4 py-4 border-b border-brand-100">
          <h2 className="font-serif text-base font-semibold text-brand-900">케어톡</h2>
          <p className="text-xs text-brand-400 mt-0.5">학부모를 선택하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {DEMO_PARENTS.map((parent) => {
            const isSelected = selectedParent.id === parent.id;
            const unread = getUnreadCount(parent.id);
            return (
              <button
                key={parent.id}
                onClick={() => setSelectedParent(parent)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-brand-50 border-r-2 border-brand-900"
                    : "hover:bg-brand-50"
                }`}
              >
                <div className="relative">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100">
                    <User className="w-4 h-4 text-brand-600" />
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-900 truncate">
                    {parent.childName} 학부모
                  </p>
                  <p className="text-xs text-brand-400">{parent.grade}</p>
                </div>
                {unread > 0 && (
                  <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 flex-shrink-0">
                    {unread}
                  </span>
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
              {selectedParent.childName} 학부모
            </h1>
            <p className="text-xs text-brand-400">
              {selectedParent.grade} · {selectedParent.phone}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-brand-400">온라인</span>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender === "admin";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs flex items-center justify-center font-medium">
                        {selectedParent.childName[0]}
                      </span>
                      <span className="text-xs text-brand-500">
                        {selectedParent.childName} 학부모
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-brand-900 text-white rounded-br-sm"
                        : "bg-white border border-brand-100 text-brand-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-brand-300">{msg.time}</span>
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
              placeholder={`${selectedParent.childName} 학부모에게 메시지 전송... (Enter로 전송)`}
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
