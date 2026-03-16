import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Target, Users } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-purple-600 p-3 rounded-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Mr.Su AI</h1>
          <p className="text-purple-300 text-lg">AI-Powered Digital Marketing Command Center</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: "Strategy", desc: "AI marketing plans" },
            { icon: Target, label: "Content", desc: "Instant creation" },
            { icon: Users, label: "Leads", desc: "CRM & pipeline" },
            { icon: Brain, label: "AI Chat", desc: "Smart assistant" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Icon className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">{label}</div>
              <div className="text-white/50 text-xs">{desc}</div>
            </div>
          ))}
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Get Started</CardTitle>
            <CardDescription className="text-white/60">
              Sign in to access your AI marketing command center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-white text-slate-900 hover:bg-white/90 font-semibold"
              onClick={signInWithGoogle}
              disabled={loading}
              size="lg"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs">
          Your data is securely stored and private to your account
        </p>
      </div>
    </div>
  );
}
