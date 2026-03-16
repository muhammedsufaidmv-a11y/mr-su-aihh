import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { generateText } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles, Trash2, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Strategy {
  id: string;
  title: string;
  goals: string;
  targetAudience: string;
  strategy: string;
  createdAt: any;
}

export default function StrategyPage() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", goals: "", targetAudience: "", businessName: "", niche: "" });

  const fetchStrategies = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "strategies"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setStrategies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Strategy)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStrategies(); }, [user]);

  const handleGenerate = async () => {
    if (!user || !form.title) return;
    setGenerating(true);
    try {
      const prompt = `You are an expert digital marketing strategist. Create a comprehensive marketing strategy for:
Business: ${form.businessName || "the business"}
Niche/Industry: ${form.niche || "general"}
Campaign Title: ${form.title}
Goals: ${form.goals || "grow brand awareness and generate leads"}
Target Audience: ${form.targetAudience || "general consumers"}

Provide a detailed strategy including:
1. Executive Summary
2. Market Analysis
3. Target Audience Personas
4. Channel Strategy (social media, content, email, paid ads)
5. Content Calendar Framework
6. KPIs & Success Metrics
7. Budget Allocation Recommendations
8. 90-Day Action Plan

Format with clear headers and actionable steps.`;

      const strategy = await generateText(prompt);
      await addDoc(collection(db, "users", user.uid, "strategies"), {
        userId: user.uid,
        title: form.title,
        goals: form.goals,
        targetAudience: form.targetAudience,
        strategy,
        createdAt: serverTimestamp(),
      });
      setForm({ title: "", goals: "", targetAudience: "", businessName: "", niche: "" });
      await fetchStrategies();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "strategies", id));
    setStrategies(s => s.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-400" /> Marketing Strategy
        </h1>
        <p className="text-white/50 mt-1">AI-powered marketing strategies tailored for your business.</p>
      </div>

      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" /> Generate New Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Campaign Title *</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="e.g., Q2 2024 Growth Campaign"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Business Name</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="e.g., Acme Corp"
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Industry / Niche</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="e.g., E-commerce, SaaS, Restaurant"
                value={form.niche}
                onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Target Audience</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="e.g., Small business owners 25-45"
                value={form.targetAudience}
                onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">Goals & Objectives</Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              placeholder="e.g., Increase brand awareness, generate 100 leads/month, grow social following by 20%"
              rows={3}
              value={form.goals}
              onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
            />
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            onClick={handleGenerate}
            disabled={generating || !form.title}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Strategy</>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />)}
        </div>
      ) : strategies.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No strategies yet. Generate your first one above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((s) => (
            <Card key={s.id} className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold">{s.title}</h3>
                    {s.targetAudience && (
                      <p className="text-white/40 text-sm mt-0.5">Audience: {s.targetAudience}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/40 hover:text-white"
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    >
                      {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400/70 hover:text-red-400"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expanded === s.id && (
                  <div className="mt-4 prose prose-invert prose-sm max-w-none text-white/80 bg-white/5 rounded-xl p-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.strategy}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
