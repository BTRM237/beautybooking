"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Flower2, MessageCircle, Phone, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ZaloIcon = () => (
  <span className="text-sm font-black">Z</span>
);

const contactItems = [
  { id: "zalo", label: "Zalo", icon: ZaloIcon, href: "https://zalo.me/0393231806", tone: "bg-[#0b6cff] text-white" },
  { id: "messenger", label: "Messenger", icon: MessageCircle, href: "https://m.me/lunamakeup", tone: "bg-[#7c4dff] text-white" },
  { id: "phone", label: "Gọi điện", icon: Phone, href: "tel:0393231806", tone: "bg-[#00bf8f] text-white" },
  { id: "ai-chat", label: "AI Chat", icon: Bot, href: "#", tone: "bg-gradient-to-br from-[#e8c7b0] to-[#d78fa0] text-[#120c12]" },
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const pathname = usePathname();
  const liftForStickyCta = pathname?.startsWith("/dat-lich") || /^\/dich-vu\/[^/]+/.test(pathname || "");

  const trackClick = async (type: string) => {
    try {
      await fetch("/api/contact/click-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "contact_click", eventData: { type } }),
      });
    } catch {}
  };

  const handleItemClick = (item: (typeof contactItems)[number]) => {
    trackClick(item.id);
    if (item.id === "ai-chat") {
      setShowChat(true);
      setIsOpen(false);
      return;
    }
    window.open(item.href, item.id === "phone" ? "_self" : "_blank");
  };

  return (
    <>
      <div
        className={cn(
          "fixed right-3 z-50 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 sm:gap-3",
          liftForStickyCta ? "bottom-24" : "bottom-5",
        )}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mb-1 grid w-[176px] gap-2 sm:w-[188px] sm:gap-2.5"
            >
              {contactItems.map((item, index) => (
                <motion.button
                  type="button"
                  key={item.id}
                  initial={{ opacity: 0, x: 18, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 18, scale: 0.96 }}
                  transition={{ delay: index * 0.045 }}
                  onClick={() => handleItemClick(item)}
                  className="group flex h-12 w-full items-center justify-between rounded-full border border-[#f3a38f]/20 bg-[#10090e]/88 px-2.5 pl-4 text-left text-white shadow-[0_16px_45px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:border-[#f3a38f]/45 hover:bg-[#171016]/94 sm:h-14 sm:px-3 sm:pl-5"
                  aria-label={item.label}
                >
                  <span className="text-[13px] font-bold leading-none text-[#f7e8e2]">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_24px_rgba(0,0,0,0.22)] transition duration-200 group-hover:scale-105 sm:h-10 sm:w-10",
                      item.tone,
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn("flex items-center gap-2", isOpen && "w-[176px] justify-end sm:w-[188px]")}>
          {!isOpen && !showChat && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="relative hidden h-11 items-center rounded-full border border-[#f3a38f]/18 bg-[#10090e]/88 px-4 text-xs font-bold text-[#f7e8e2] shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-2xl after:absolute after:-right-[5px] after:top-1/2 after:h-2.5 after:w-2.5 after:-translate-y-1/2 after:rotate-45 after:border-r after:border-t after:border-[#f3a38f]/18 after:bg-[#10090e]/88 sm:inline-flex"
            >
              Tư vấn ngay
            </motion.div>
          )}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (showChat) {
                setShowChat(false);
                setIsOpen(false);
              } else {
                setIsOpen((value) => !value);
              }
            }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(135deg,#ffe7d8_0%,#f0b9a7_55%,#d78fa0_100%)] text-[#120c12] shadow-[0_18px_48px_rgba(232,199,176,0.30)] outline-none transition focus-visible:ring-4 focus-visible:ring-[#f3a38f]/25 sm:h-16 sm:w-16"
            aria-label={isOpen || showChat ? "Đóng tư vấn" : "Tư vấn ngay"}
          >
            <span className="absolute inset-[6px] rounded-full border border-white/20 sm:inset-[7px]" />
            <AnimatePresence mode="wait">
              {isOpen || showChat ? (
                <motion.span key="close" initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }}>
                  <X className="relative h-6 w-6" strokeWidth={2.2} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -60, opacity: 0 }}>
                  <Flower2 className="relative h-6 w-6" strokeWidth={2.1} />
                </motion.span>
              )}
            </AnimatePresence>
            {!isOpen && !showChat && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                1
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showChat && (
          <AiChatPanel liftForStickyCta={Boolean(liftForStickyCta)} onClose={() => setShowChat(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function AiChatPanel({ liftForStickyCta, onClose }: { liftForStickyCta: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Dạ chào chị! Em là trợ lý tư vấn của LUNA Makeup Studio. Chị cần tư vấn dịch vụ makeup nào ạ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  const suggestions = ["Bảng giá", "Đặt lịch", "Makeup cô dâu", "Makeup dự tiệc", "Địa chỉ studio"];

  useEffect(() => {
    // Generate a unique session ID for this chat instance
    if (!sessionIdRef.current) {
      sessionIdRef.current = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text.trim(), 
          history,
          sessionId: sessionIdRef.current
        }),
      });
      
      const data = await res.json();
      
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Dạ hệ thống tư vấn đang hơi bận ạ. Anh/chị có thể nhắn Zalo 039 323 1806 để được hỗ trợ nhanh hơn nha." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96, transformOrigin: "bottom right" }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 36, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "fixed right-3 z-[70] flex w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B10]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transform-gpu will-change-transform sm:right-6",
        liftForStickyCta ? "bottom-28 h-[min(520px,calc(100dvh-9rem))]" : "bottom-20 h-[min(600px,calc(100dvh-6rem))]",
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#120c12]/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#e8c7b0] to-[#d78fa0] text-[#120c12]">
            <Bot className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#120c12] bg-emerald-400"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">LUNA AI Assistant</h3>
            <p className="text-xs text-[#e8c7b0]">Trực tuyến</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#e8c7b0] to-[#d78fa0] text-[#120c12] rounded-tr-sm"
                      : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-sm"
                  )}
                >
                  {msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i} className="font-bold text-[#e8c7b0]">{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-[#e8c7b0]"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-[#e8c7b0]"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-[#e8c7b0]"></motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length < 3 && (
        <div className="border-t border-white/5 bg-[#120c12]/50 p-3">
          <div className="flex flex-wrap gap-2 pb-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="shrink-0 rounded-full border border-[#e8c7b0]/30 bg-[#e8c7b0]/5 px-3 py-1.5 text-xs text-[#e8c7b0] transition-colors hover:bg-[#e8c7b0]/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/10 bg-[#120c12]/80 p-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-4 pr-1 focus-within:border-[#e8c7b0]/50 focus-within:bg-white/10 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Nhập câu hỏi..."
            className="h-11 flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8c7b0] text-[#120c12] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
