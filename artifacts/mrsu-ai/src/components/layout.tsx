import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Brain,
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  MessageSquare,
  Zap,
  Menu,
  X,
  LogOut,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/strategy", label: "Strategy", icon: Target },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/tools", label: "AI Tools", icon: Zap },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 
        transform transition-transform duration-200 flex flex-col
        lg:relative lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <div className="bg-purple-600 p-2 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">Mr.Su AI</span>
          <button
            className="ml-auto lg:hidden text-white/50 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-3 border-t border-white/10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback className="bg-purple-700 text-white text-xs">
                      {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="text-white text-xs font-medium truncate">{user.displayName || "User"}</div>
                    <div className="text-white/40 text-xs truncate">{user.email}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-48 bg-slate-800 border-white/10">
                <DropdownMenuItem
                  className="text-red-400 cursor-pointer"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-white/10 bg-slate-900">
          <button
            className="text-white/70 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Mr.Su AI</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
