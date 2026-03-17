import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  FileText,
  CheckSquare,
  Target,
  TrendingUp,
  MessageSquare,
  Zap,
  ArrowRight,
  Plus,
} from "lucide-react";

interface Stats {
  leads: number;
  content: number;
  tasks: number;
  strategies: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ leads: 0, content: 0, tasks: 0, strategies: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        const leads = leadsSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() }));
        setRecentLeads(leads);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const displayName = user?.displayName?.split(" ")[0] || "there";

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
      {/* Personalized Greeting Section */}
      <div className="relative p-8 rounded-3xl bg-[#1e1f20]/60 border border-white/10 backdrop-blur-xl overflow-hidden">
        {/* Floating Sparkles */}
        <div className="absolute top-4 left-10 text-yellow-400 animate-sparkle opacity-50">✨</div>
        <div className="absolute bottom-4 right-20 text-yellow-200 animate-sparkle opacity-30" style={{ animationDelay: "700ms" }}>✨</div>
        <div className="absolute top-10 right-10 text-white animate-sparkle opacity-40" style={{ animationDelay: "300ms" }}>✦</div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#8ab4f8] mb-3">
            Hey {user?.displayName?.split(" ")[0] || "Shifa"},{" "}
            <span className="text-white">how can I help you today?</span>
          </h1>
          <div className="flex items-center gap-3 py-2 px-4 w-fit rounded-full bg-pink-500/10 border border-pink-500/20">
            <span className="text-xl animate-heartbeat">❤️</span>
            <p className="text-sm font-medium text-pink-300">
              Built with love for the best wife. You're the heart of Mr.Su AI!
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
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
        {/* Quick Actions */}
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

        {/* Recent Leads */}
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
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                  ))}
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

      {/* AI Feature Highlights */}
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
    </div>
  );
}
