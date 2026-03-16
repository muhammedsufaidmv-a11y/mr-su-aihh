import { useEffect, useRef, useState } from "react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { generateStream } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2, Bot, User, Loader2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  createdAt?: any;
}

const SYSTEM_PROMPT = `You are Mr.Su AI, an expert digital marketing assistant. You help businesses with:
- Marketing strategies and campaigns
- Content creation and copywriting
- Social media management
- Lead generation and sales
- Business growth and analytics
- SEO and digital advertising

Be concise, actionable, and professional. Format responses with markdown when helpful.`;

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "messages"), orderBy("createdAt", "asc"));
      const snap = await getDocs(q);
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [user]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!user || !input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const savedInput = input.trim();
    setInput("");
    setMessages(m => [...m, userMsg]);

    await addDoc(collection(db, "users", user.uid, "messages"), {
      role: "user",
      content: savedInput,
      createdAt: serverTimestamp(),
    });

    setStreaming(true);
    let aiText = "";
    const aiMsg: Message = { role: "ai", content: "" };
    setMessages(m => [...m, aiMsg]);

    try {
      const history = messages.slice(-10).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const prompt = history ? `${history}\nUser: ${savedInput}` : savedInput;

      await generateStream(
        prompt,
        (chunk) => {
          aiText += chunk;
          setMessages(m => {
            const updated = [...m];
            updated[updated.length - 1] = { role: "ai", content: aiText };
            return updated;
          });
        },
        SYSTEM_PROMPT
      );

      await addDoc(collection(db, "users", user.uid, "messages"), {
        role: "ai",
        content: aiText,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = { role: "ai", content: "Sorry, I encountered an error. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "messages"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "users", user.uid, "messages", d.id))));
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const STARTERS = [
    "Create a marketing strategy for my business",
    "Write an Instagram post about our new product",
    "How do I generate more leads for my service?",
    "What are the best SEO practices for 2024?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-pink-400" /> AI Chat
          </h1>
          <p className="text-white/50 text-sm">Your AI marketing assistant</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={handleClearChat}>
            <RotateCcw className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="bg-pink-600/20 p-4 rounded-2xl w-fit mx-auto mb-3">
                <Bot className="h-10 w-10 text-pink-400" />
              </div>
              <h2 className="text-white font-semibold text-lg">How can I help you today?</h2>
              <p className="text-white/40 text-sm mt-1">Ask me anything about digital marketing</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {STARTERS.map(s => (
                <button
                  key={s}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-sm text-left transition-colors"
                  onClick={() => { setInput(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="bg-pink-600/20 p-1.5 rounded-lg h-fit shrink-0">
                    <Bot className="h-4 w-4 text-pink-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-white/85 border border-white/10"
                }`}>
                  {msg.role === "ai" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "▋"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="bg-purple-600/20 p-1.5 rounded-lg h-fit shrink-0">
                    <User className="h-4 w-4 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="shrink-0 pt-3 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            className="bg-slate-800/80 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[48px] max-h-32"
            placeholder="Ask about marketing, content, leads, strategy..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            className="bg-pink-600 hover:bg-pink-700 shrink-0 h-12"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-white/20 text-xs mt-1.5 text-center">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
