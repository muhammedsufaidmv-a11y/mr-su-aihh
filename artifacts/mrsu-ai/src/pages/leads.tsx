import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Edit, Mail, Phone } from "lucide-react";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "closed", "lost"] as const;
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface Lead {
  id: string;
  name: string;
  email?: string;
  source?: string;
  status: string;
  notes?: string;
  createdAt: any;
}

const EMPTY_FORM = { name: "", email: "", source: "", status: "new", notes: "" };

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchLeads = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "leads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.name) return;
    if (editId) {
      await updateDoc(doc(db, "users", user.uid, "leads", editId), { ...form });
    } else {
      await addDoc(collection(db, "users", user.uid, "leads"), {
        userId: user.uid, ...form, createdAt: serverTimestamp(),
      });
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setDialogOpen(false);
    await fetchLeads();
  };

  const handleEdit = (lead: Lead) => {
    setForm({ name: lead.name, email: lead.email || "", source: lead.source || "", status: lead.status, notes: lead.notes || "" });
    setEditId(lead.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "leads", id));
    setLeads(l => l.filter(x => x.id !== id));
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "leads", id), { status });
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x));
  };

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);
  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" /> Lead Management
          </h1>
          <p className="text-white/50 mt-1">Track and manage your potential customers.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setForm(EMPTY_FORM); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Lead" : "Add New Lead"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Name *</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Email</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Source</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="e.g., Instagram, Referral" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Notes</Label>
                <Textarea className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none" placeholder="Any notes about this lead..." rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={!form.name}>
                {editId ? "Update Lead" : "Add Lead"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-5 gap-2">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`p-2 rounded-xl border text-center transition-colors ${
              filter === s ? STATUS_COLORS[s] : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            <div className="text-lg font-bold">{counts[s] || 0}</div>
            <div className="text-xs capitalize">{s}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No leads {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <Card key={lead.id} className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{lead.name}</span>
                      <Select value={lead.status} onValueChange={v => handleStatusChange(lead.id, v)}>
                        <SelectTrigger className={`h-6 text-xs px-2 border rounded-full w-auto ${STATUS_COLORS[lead.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10">
                          {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-white capitalize text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                      {lead.source && <span>via {lead.source}</span>}
                    </div>
                    {lead.notes && <p className="text-white/40 text-xs mt-1 truncate">{lead.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={() => handleEdit(lead)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400/70 hover:text-red-400" onClick={() => handleDelete(lead.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
