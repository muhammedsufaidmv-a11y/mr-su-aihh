import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { generateText } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Trash2, Loader2, Copy, Check, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PLATFORMS = ["instagram", "linkedin", "facebook", "tiktok", "blog"] as const;

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  linkedin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  facebook: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  blog: "bg-green-500/20 text-green-400 border-green-500/30",
};

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  hashtags?: string[];
  status: string;
  createdAt: any;
}

export default function ContentPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ platform: "instagram", topic: "", businessName: "", tone: "professional" });
  const [filter, setFilter] = useState("all");

  const fetchItems = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "content"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentItem)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [user]);

  const handleGenerate = async () => {
    if (!user || !form.topic) return;
    setGenerating(true);
    try {
      const platformInstructions: Record<string, string> = {
        instagram: "Create an engaging Instagram post with emojis, a hook, value content, and 10-15 relevant hashtags. Keep under 300 words.",
        linkedin: "Write a professional LinkedIn post with a thought-provoking opening, insights, and a call to action. 150-250 words. No hashtags spam.",
        facebook: "Write a friendly, conversational Facebook post that encourages engagement and shares. 100-200 words.",
        tiktok: "Write a TikTok video script with hook (first 3 seconds), main content, and call to action. Include text overlay suggestions.",
        blog: "Write a comprehensive blog post with an SEO-friendly title, introduction, 3-5 main sections with subheadings, and conclusion.",
      };

      const prompt = `You are a professional content creator. ${platformInstructions[form.platform]}

Business/Brand: ${form.businessName || "a business"}
Topic: ${form.topic}
Tone: ${form.tone}

Generate engaging, high-quality content that resonates with the platform's audience.`;

      const content = await generateText(prompt);
      const hashtags = content.match(/#\w+/g) || [];
      
      await addDoc(collection(db, "users", user.uid, "content"), {
        userId: user.uid,
        type: form.platform,
        title: form.topic,
        content,
        hashtags,
        status: "draft",
        createdAt: serverTimestamp(),
      });
      setForm(f => ({ ...f, topic: "" }));
      await fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "content", id));
    setItems(i => i.filter(x => x.id !== id));
  };

  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-green-400" /> Content Creator
        </h1>
        <p className="text-white/50 mt-1">AI-generated content for all your marketing channels.</p>
      </div>

      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-400" /> Generate Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Platform</Label>
              <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {PLATFORMS.map(p => (
                    <SelectItem key={p} value={p} className="text-white capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Tone</Label>
              <Select value={form.tone} onValueChange={v => setForm(f => ({ ...f, tone: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {["professional", "casual", "humorous", "inspirational", "educational"].map(t => (
                    <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Business Name</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="Your brand name"
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">Topic / Prompt *</Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              placeholder="e.g., 5 tips for small business owners, New product launch announcement, Behind the scenes of our team..."
              rows={2}
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            />
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={handleGenerate}
            disabled={generating || !form.topic}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Content</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...PLATFORMS].map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === p ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No content yet. Generate your first piece above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <Card key={item.id} className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <Badge variant="outline" className={`mt-1 text-xs capitalize ${PLATFORM_COLORS[item.type] || ""}`}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/40 hover:text-white"
                      onClick={() => handleCopy(item.id, item.content)}
                    >
                      {copied === item.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400/70 hover:text-red-400"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-white/70 text-sm whitespace-pre-wrap bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {item.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
