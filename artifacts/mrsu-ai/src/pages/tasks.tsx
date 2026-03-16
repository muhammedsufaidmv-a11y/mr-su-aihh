import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Plus, Trash2, Edit, Calendar } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt: any;
}

const EMPTY_FORM = { title: "", description: "", priority: "medium", status: "todo", dueDate: "", assignedTo: "" };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.title) return;
    if (editId) {
      await updateDoc(doc(db, "users", user.uid, "tasks", editId), { ...form });
    } else {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        userId: user.uid, ...form, createdAt: serverTimestamp(),
      });
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setDialogOpen(false);
    await fetchTasks();
  };

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateDoc(doc(db, "users", user!.uid, "tasks", task.id), { status: newStatus });
    setTasks(t => t.map(x => x.id === task.id ? { ...x, status: newStatus } : x));
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    setTasks(t => t.filter(x => x.id !== id));
  };

  const handleEdit = (task: Task) => {
    setForm({ title: task.title, description: task.description || "", priority: task.priority, status: task.status, dueDate: task.dueDate || "", assignedTo: task.assignedTo || "" });
    setEditId(task.id);
    setDialogOpen(true);
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter || t.priority === filter);
  const todo = tasks.filter(t => t.status === "todo").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const done = tasks.filter(t => t.status === "done").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-yellow-400" /> Task Manager
          </h1>
          <p className="text-white/50 mt-1">Organize and track your team's marketing tasks.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setForm(EMPTY_FORM); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-1" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Task" : "Create Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-white/70">Title *</Label>
                <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Textarea className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none" placeholder="Task details..." rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {["high", "medium", "low"].map(p => <SelectItem key={p} value={p} className="text-white capitalize">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {["todo", "in-progress", "done"].map(s => <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Due Date</Label>
                  <Input type="date" className="bg-white/5 border-white/10 text-white" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Assigned To</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="Team member name" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
                </div>
              </div>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={handleSubmit} disabled={!form.title}>
                {editId ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "To Do", count: todo, id: "todo", color: "text-white/60" }, { label: "In Progress", count: inProgress, id: "in-progress", color: "text-yellow-400" }, { label: "Done", count: done, id: "done", color: "text-green-400" }].map(({ label, count, id, color }) => (
          <button
            key={id}
            onClick={() => setFilter(filter === id ? "all" : id)}
            className={`p-3 rounded-xl border text-center transition-colors ${filter === id ? "bg-white/10 border-white/20" : "bg-slate-800/50 border-white/10 hover:border-white/20"}`}
          >
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-white/50 text-sm mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <Card key={task.id} className={`bg-slate-800/50 border-white/10 ${task.status === "done" ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => handleToggle(task)}
                    className="mt-0.5 border-white/30 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-white font-medium ${task.status === "done" ? "line-through text-white/50" : ""}`}>{task.title}</span>
                      <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
                    </div>
                    {task.description && <p className="text-white/40 text-xs mt-1">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      {task.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{task.dueDate}</span>}
                      {task.assignedTo && <span>→ {task.assignedTo}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={() => handleEdit(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400/70 hover:text-red-400" onClick={() => handleDelete(task.id)}>
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
