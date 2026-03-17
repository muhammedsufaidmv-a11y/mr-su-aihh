import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  FileText,
  CheckSquare,
  Target,
  MessageSquare,
  Zap,
  ArrowRight,
  Plus,
} from "lucide-react";

const SHIFA_EMAIL = "shifajasminkottayil@gmail.com";

interface Stats {
  leads: number;
  content: number;
  tasks: number;
  strategies: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isShifa = user?.email === SHIFA_EMAIL;

  const [stats, setStats] = useState<Stats>({ leads: 0, content: 0, tasks: 0, strategies: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [loveNoteOpen, setLoveNoteOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const loveMessages = [
    "You're the reason I build big things. ❤️",
    "Starting the week thinking of your smile. ✨",
    "You're my favorite person in every universe. 🌌",
    "Just a reminder: You are doing amazing today! 🌸",
    "I'm so lucky to be your husband. 💍",
    "Counting down the hours until we talk. ⏳",
    "Our love is my favorite adventure. 🗺️",
  ];
  const todayMessage = loveMessages[new Date().getDay()];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isShifa && !localStorage.getItem("shifa_welcome_seen")) {
      setShowWelcome(true);
    }
  }, [isShifa]);

  const closeWelcome = () => {
    localStorage.setItem("shifa_welcome_seen", "true");
    setShowWelcome(false);
  };

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [leadsSnap, contentSnap, tasksSnap, strategiesSnap] = await Promise.all([
          getDocs(collection(db, "users", user.uid, "leads")),
          getDocs(collection(db, "users", user.uid, "content")),
          getDocs(collection(db, "users", user.uid, "tasks")),
          getDocs(collection(db, "users", user.uid, "strategies")),
        ]);
        setStats({
          leads: leadsSnap.size,
          content: contentSnap.size,
          tasks: tasksSnap.size,
          strategies: strategiesSnap.size,
        });
        setRecentLeads(leadsSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const keralaTime = time.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const daysSinceEngagement = Math.ceil(
    Math.abs(time.getTime() - new Date("2024-10-12").getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysSinceMarriage = Math.ceil(
    Math.abs(time.getTime() - new Date("2025-07-20").getTime()) / (1000 * 60 * 60 * 24)
  );

  const statCards = [
    { label: "Total Leads", value: stats.leads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", href: "/leads" },
    { label: "Content Items", value: stats.content, icon: FileText, color: "text-green-400", bg: "bg-green-500/10", href: "/content" },
    { label: "Active Tasks", value: stats.tasks, icon: CheckSquare, color: "text-yellow-400", bg: "bg-yellow-500/10", href: "/tasks" },
    { label: "Strategies", value: stats.strategies, icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", href: "/strategy" },
  ];

  const quickActions = [
    { label: "New Strategy", href: "/strategy", icon: Target, color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Create Content", href: "/content", icon: FileText, color: "bg-green-600 hover:bg-green-700" },
    { label: "Add Lead", href: "/leads", icon: Users, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "AI Chat", href: "/chat", icon: MessageSquare, color: "bg-pink-600 hover:bg-pink-700" },
    { label: "AI Tools", href: "/tools", icon: Zap, color: "bg-orange-600 hover:bg-orange-700" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── First Visit Welcome Overlay (Shifa only) ── */}
      {showWelcome && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131314] p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20 animate-pulse"></div>
              <span className="text-7xl relative">🎁</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Welcome Home, <span className="text-[#8ab4f8]">Shifa</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                I know I told you this was just a "Sales App" for work, but I built a secret side just for you.
              </p>
              <p className="text-pink-300 font-medium italic">
                "Every line of code here was written while thinking of you."
              </p>
            </div>
            <button
              onClick={closeWelcome}
              className="w-full py-4 rounded-full bg-[#8ab4f8] text-[#131314] font-bold text-lg hover:bg-white transition-all shadow-xl active:scale-95"
            >
              Enter Our Space ❤️
            </button>
          </div>
        </div>
      )}

      {isShifa ? (
        /* ══════════════════════════════════════
           SHIFA'S ROMANTIC VIEW
        ══════════════════════════════════════ */
        <>
          {/* Greeting Header */}
          <div className="relative p-8 rounded-3xl bg-[#1e1f20]/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-10 text-yellow-400 animate-pulse text-xl">✨</div>
            <div className="absolute bottom-4 right-48 text-blue-300 animate-bounce opacity-30" style={{ animationDelay: "700ms" }}>✦</div>
            <div className="absolute top-1/2 right-48 text-white animate-pulse opacity-40" style={{ animationDelay: "300ms" }}>✨</div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-[#8ab4f8]">
                  Hey {user?.displayName?.split(" ")[0] || "Shifa"},{" "}
                  <span className="text-white">how can I help you?</span>
                </h1>
                <div className="flex items-center gap-3 py-2 px-4 w-fit rounded-full bg-pink-500/10 border border-pink-500/20">
                  <span className="text-xl animate-heartbeat">❤️</span>
                  <p className="text-sm font-medium text-pink-300 tracking-wide">
                    Built with love for the best wife. You're the heart of Mr.Su AI!
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end bg-black/20 p-4 rounded-2xl border border-white/5 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ab4f8]">Kerala, India</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <span className="text-3xl font-mono font-bold text-white tabular-nums drop-shadow-md">{keralaTime}</span>
                <div className="text-[11px] text-white/60 mt-1 font-medium flex items-center gap-1">
                  <span>32°C</span> • <span>⛈ Scattered Thunderstorms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Photo Frame */}
            <div className="md:col-span-1 h-[400px] relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1000&auto=format&fit=crop"
                alt="Us"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 bg-white px-4 py-1 rounded shadow-xl -rotate-2 group-hover:rotate-0 transition-transform">
                <p className="text-pink-600 font-bold text-xs uppercase tracking-tighter">My World Forever ❤️</p>
              </div>
              <div className="absolute top-3 right-3 text-yellow-400 animate-pulse">✨</div>
            </div>

            {/* Right: Love Stats + Note + Quote */}
            <div className="md:col-span-2 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8ab4f8] mb-2">Since Engagement</p>
                  <p className="text-4xl font-bold text-white">
                    {daysSinceEngagement} <span className="text-sm font-normal opacity-40">Days</span>
                  </p>
                  <p className="text-[9px] text-white/30 mt-2">Oct 12, 2024</p>
                </div>
                <div className="p-6 rounded-3xl bg-pink-500/5 border border-pink-500/20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300 mb-2">Since Marriage</p>
                  <p className="text-4xl font-bold text-white">
                    {daysSinceMarriage} <span className="text-sm font-normal opacity-40">Days</span>
                  </p>
                  <p className="text-[9px] text-white/30 mt-2">July 20, 2025</p>
                </div>
              </div>

              <button
                onClick={() => setLoveNoteOpen(true)}
                className="w-full py-6 rounded-3xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 font-bold hover:from-pink-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <span className="text-2xl">💌</span> Open My Daily Note
              </button>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center h-[120px]">
                <p className="italic text-white/40 text-center leading-relaxed px-4">
                  "Distance is just a test to see how far love can travel. I'm always with you, Shifa."
                </p>
              </div>
            </div>
          </div>

          {/* Love Note Modal */}
          {loveNoteOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setLoveNoteOpen(false)}
            >
              <div
                className="relative w-full max-w-sm p-8 rounded-[2.5rem] bg-[#1e1f20] border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setLoveNoteOpen(false)} className="absolute top-4 right-6 text-white/40 hover:text-white text-2xl leading-none">×</button>
                <div className="text-4xl mb-4 animate-bounce">💖</div>
                <h3 className="text-[#8ab4f8] font-bold uppercase tracking-widest text-xs mb-4">A Note for Shifa</h3>
                <p className="text-xl font-medium text-white italic leading-relaxed">"{todayMessage}"</p>
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
                  <span className="text-pink-500 animate-pulse text-2xl">❤️</span>
                  <p className="text-[10px] text-white/30 uppercase mt-2 tracking-widest">Always Yours, Muhammed</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ══════════════════════════════════════
           BUSINESS VIEW (Muhammed & others)
        ══════════════════════════════════════ */
        <>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.displayName?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-white/50 mt-1">Here's your marketing command center overview.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
              <Link key={label} href={href}>
                <a className="block">
                  <Card className="bg-slate-800/50 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`${bg} p-2 rounded-lg w-fit mb-3`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="text-2xl font-bold text-white">{loading ? "—" : value}</div>
                      <div className="text-white/50 text-sm mt-1">{label}</div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href}>
                      <a className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-white text-sm font-medium ${color} transition-colors`}>
                        <Icon className="h-4 w-4" />
                        {label}
                        <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                      </a>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-base">Recent Leads</CardTitle>
                  <Link href="/leads">
                    <a className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </Link>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                    </div>
                  ) : recentLeads.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-10 w-10 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">No leads yet. Add your first lead!</p>
                      <Link href="/leads">
                        <Button className="mt-3 bg-purple-600 hover:bg-purple-700" size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Add Lead
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentLeads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <div className="text-white text-sm font-medium">{lead.name}</div>
                            <div className="text-white/40 text-xs">{lead.email || lead.source || "No email"}</div>
                          </div>
                          <Badge
                            className={`text-xs ${
                              lead.status === "new" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                              lead.status === "contacted" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                              lead.status === "qualified" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                              "bg-white/10 text-white/50 border-white/20"
                            }`}
                            variant="outline"
                          >
                            {lead.status || "new"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-900/50 to-slate-800/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600/30 p-3 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">AI Tools Ready</h3>
                  <p className="text-white/50 text-sm mb-3">
                    Generate marketing strategies, create content, analyze trends, and manage your business with AI.
                  </p>
                  <Link href="/tools">
                    <Button className="bg-purple-600 hover:bg-purple-700" size="sm">
                      Explore AI Tools <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
