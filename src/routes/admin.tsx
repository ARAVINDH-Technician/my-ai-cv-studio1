import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Lock, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { deleteAdminResume, readAdminResumes, type AdminResume } from "@/components/resume/adminStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1admin234";
const ADMIN_SESSION_KEY = "inkwell_admin_session";

function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);
  const resumes = readAdminResumes();
  const selected = resumes.find((resume) => resume.id === selectedId) ?? resumes[0] ?? null;

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAuthed(true);
      toast.success("Admin login successful");
      return;
    }
    toast.error("Invalid admin username or password");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthed(false);
    setPassword("");
  };

  const handleDelete = (resume: AdminResume) => {
    deleteAdminResume(resume.id);
    if (selectedId === resume.id) setSelectedId(null);
    setRefreshKey((key) => key + 1);
    toast.success("Resume removed from admin panel");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07152d] text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Saved resumes are visible only here.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-username">Username</Label>
            <Input id="admin-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Login
          </Button>
          <Link to="/auth" className="block text-center text-sm text-muted-foreground hover:text-accent">
            Back to user login
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">All saved resumes are stored here for admin review.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm font-semibold text-accent hover:underline">
              Builder
            </Link>
            <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[420px_minmax(0,1fr)] gap-8">
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-4">Saved resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved resumes yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {resumes.map((resume) => (
                <li key={resume.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(resume.id)}
                    className={`w-full text-left rounded-md p-3 transition-colors ${
                      selected?.id === resume.id ? "bg-accent/10" : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-semibold truncate">{resume.name || "Untitled resume"}</div>
                    <div className="text-xs text-muted-foreground truncate">{resume.email}</div>
                    <div className="text-xs text-muted-foreground truncate">User: {resume.userEmail}</div>
                  </button>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(resume.id)}>
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(resume)}>
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">{selected.name || "Untitled resume"}</h2>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
              </div>
              <ResumePreview data={selected} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a saved resume to view it.</p>
          )}
        </section>
      </main>
    </div>
  );
}
