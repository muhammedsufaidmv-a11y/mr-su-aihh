import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { generateText } from "@/lib/gemini";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap, Hash, Mail, TrendingUp, Search, PenTool,
  Sparkles, Loader2, Copy, Check, Save
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: ToolField[];
  promptBuilder: (inputs: Record<string, string>) => string;
}

interface ToolField {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
}

const TOOLS: Tool[] = [
  {
    id: "hashtag",
    name: "Hashtag Generator",
    description: "Generate targeted hashtags for any platform and niche",
    icon: Hash,
    color: "text-pink-400",
    fields: [
      { key: "topic", label: "Topic / Niche", placeholder: "e.g., fitness, cooking, technology" },
      { key: "platform", label: "Platform", type: "select", placeholder: "Platform", options: ["Instagram", "TikTok", "LinkedIn", "Twitter"] },
    ],
    promptBuilder: (i) => `Generate 30 high-performing hashtags for ${i.platform || "social media"} about: ${i.topic}. 
Mix of: 5 mega hashtags (1M+ posts), 10 large (100K-1M), 10 medium (10K-100K), 5 niche (under 10K).
Format: group them by category with labels.`,
  },
  {
    id: "email",
    name: "Email Sequence",
    description: "Write a complete email marketing sequence",
    icon: Mail,
    color: "text-blue-400",
    fields: [
      { key: "product", label: "Product/Service", placeholder: "What are you selling?" },
      { key: "audience", label: "Target Audience", placeholder: "Who is your customer?" },
      { key: "goal", label: "Campaign Goal", placeholder: "e.g., launch, nurture, re-engagement" },
    ],
    promptBuilder: (i) => `Write a 5-email marketing sequence for:
Product: ${i.product}
Audience: ${i.audience}
Goal: ${i.goal}

Email 1: Welcome/Introduction
Email 2: Value/Education
Email 3: Social Proof/Case Study
Email 4: Objection Handling
Email 5: Strong CTA/Close

Include subject lines, preview text, and body copy for each. Make them compelling and conversion-focused.`,
  },
  {
    id: "trend",
    name: "Trend Analysis",
    description: "Identify trends and opportunities in your market",
    icon: TrendingUp,
    color: "text-green-400",
    fields: [
      { key: "industry", label: "Industry/Niche", placeholder: "e.g., health & wellness, SaaS, e-commerce" },
      { key: "business", label: "Your Business", placeholder: "Brief description of your business" },
    ],
    promptBuilder: (i) => `Analyze current trends for the ${i.industry} industry and how they apply to: ${i.business}

Provide:
1. Top 5 current trends with explanation
2. Emerging opportunities to capitalize on
3. Threats to watch out for
4. Recommended content themes and topics
5. Platform-specific recommendations
6. 30-day action plan to leverage these trends

Be specific and actionable.`,
  },
  {
    id: "seo",
    name: "SEO Keywords",
    description: "Research keywords and optimize your content strategy",
    icon: Search,
    color: "text-yellow-400",
    fields: [
      { key: "topic", label: "Main Topic", placeholder: "Your core topic or product" },
      { key: "business", label: "Business Type", placeholder: "e.g., local restaurant, online store, consultant" },
    ],
    promptBuilder: (i) => `Generate a comprehensive SEO keyword strategy for: ${i.topic}
Business type: ${i.business}

Provide:
1. Primary keywords (high intent, buying keywords) - 10 keywords with search intent
2. Long-tail keywords (3-5 words) - 20 keywords
3. Question keywords (for FAQ/blog content) - 10 questions
4. Local SEO keywords (if applicable) - 5 keywords
5. Content cluster ideas based on these keywords
6. Blog post title suggestions for the top 5 keywords

Format in a clear, organized table where possible.`,
  },
  {
    id: "ad",
    name: "Ad Copy Generator",
    description: "Create high-converting ad copy for paid campaigns",
    icon: Zap,
    color: "text-orange-400",
    fields: [
      { key: "product", label: "Product/Service", placeholder: "What you're advertising" },
      { key: "audience", label: "Target Audience", placeholder: "Who you're targeting" },
      { key: "platform", label: "Platform", type: "select", placeholder: "Ad Platform", options: ["Facebook/Instagram", "Google", "LinkedIn", "TikTok"] },
      { key: "goal", label: "Goal", type: "select", placeholder: "Campaign goal", options: ["Awareness", "Traffic", "Leads", "Sales"] },
    ],
    promptBuilder: (i) => `Create 5 ad copy variations for ${i.platform || "social media"} ads:
Product: ${i.product}
Audience: ${i.audience}
Goal: ${i.goal}

For each variation provide:
- Headline (30 chars max for Google, 40 for Facebook)
- Primary text / Description (125 chars for Facebook, 90 for Google)
- Call to Action button text
- Hook strategy used

Make each variation test a different angle: pain point, benefit, social proof, urgency, curiosity.`,
  },
  {
    id: "bio",
    name: "Social Bio Writer",
    description: "Craft compelling social media bios and profiles",
    icon: PenTool,
    color: "text-purple-400",
    fields: [
      { key: "name", label: "Name / Brand", placeholder: "Your name or business" },
      { key: "niche", label: "Niche", placeholder: "What you do" },
      { key: "audience", label: "Who You Help", placeholder: "Your target customer" },
      { key: "platform", label: "Platform", type: "select", placeholder: "Platform", options: ["Instagram", "LinkedIn", "Twitter/X", "TikTok", "Facebook"] },
    ],
    promptBuilder: (i) => `Write 3 compelling ${i.platform || "social media"} bios for:
Name/Brand: ${i.name}
Niche: ${i.niche}  
Target audience: ${i.audience}

Each bio should:
- Hook attention immediately
- Clearly communicate value
- Include relevant keywords
- End with a CTA or link mention

Bio 1: Professional/authoritative tone
Bio 2: Friendly/approachable tone
Bio 3: Benefit-focused/results-oriented tone

Also suggest: profile photo style, highlight categories (if Instagram), pinned post ideas.`,
  },
];

export default function ToolsPage() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<Tool>(TOOLS[0]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!activeTool) return;
    setGenerating(true);
    setResult("");
    try {
      const prompt = activeTool.promptBuilder(inputs);
      const text = await generateText(prompt, "You are an expert digital marketing specialist. Provide detailed, actionable, professional output.");
      setResult(text);
    } catch (e) {
      console.error(e);
      setResult("Error generating content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    await addDoc(collection(db, "users", user.uid, "results"), {
      type: activeTool.id,
      content: result,
      timestamp: serverTimestamp(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    setInputs({});
    setResult("");
  };

  const Icon = activeTool.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-400" /> AI Marketing Tools
        </h1>
        <p className="text-white/50 mt-1">Powerful AI tools for every aspect of your marketing.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TOOLS.map(tool => {
          const T = tool.icon;
          const active = activeTool.id === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool)}
              className={`p-3 rounded-xl border text-center transition-all ${
                active ? "bg-white/15 border-white/30" : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <T className={`h-5 w-5 mx-auto mb-1 ${tool.color}`} />
              <div className="text-white text-xs font-medium leading-tight">{tool.name.split(" ")[0]}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon className={`h-5 w-5 ${activeTool.color}`} />
              {activeTool.name}
            </CardTitle>
            <CardDescription className="text-white/50">{activeTool.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTool.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-white/70">{field.label}</Label>
                {field.type === "select" ? (
                  <Select value={inputs[field.key] || ""} onValueChange={v => setInputs(i => ({ ...i, [field.key]: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {field.options?.map(o => <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                    placeholder={field.placeholder}
                    rows={3}
                    value={inputs[field.key] || ""}
                    onChange={e => setInputs(i => ({ ...i, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    placeholder={field.placeholder}
                    value={inputs[field.key] || ""}
                    onChange={e => setInputs(i => ({ ...i, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Result</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={handleSave}>
                    {saved ? <Check className="h-4 w-4 text-green-400" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generating ? (
              <div className="flex items-center justify-center h-64 gap-2 text-white/40">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-sm max-w-none text-white/80 max-h-96 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-white/20">
                <Sparkles className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Fill in the fields and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
