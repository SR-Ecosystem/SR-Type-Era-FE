import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Square, Trash2, Users, ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";
import Navbar from "../../components/Navbar";
import { adminCompAPI } from "../../api/services";
import { Competition } from "../../utils/types";
import LogoLoader from "../../components/LogoLoader";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  Draft:   "bg-slate-100 text-slate-500",
  Waiting: "bg-amber-100 text-amber-700",
  Active:  "bg-emerald-100 text-emerald-700",
  Ended:   "bg-red-100 text-red-600",
};

const NEXT_STATUS: Record<string, string> = {
  Draft:   "Waiting",
  Waiting: "Active",
  Active:  "Ended",
  Ended:   "Draft",
};

interface EditState { name: string; paragraph: string; timeLimit: number; }

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editId,       setEditId]       = useState<string | null>(null);
  const [editState,    setEditState]    = useState<EditState>({ name: "", paragraph: "", timeLimit: 60 });
  const [newComp,      setNewComp]      = useState({ name: "", paragraph: "", timeLimit: 60 });
  const [creating,     setCreating]     = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCompAPI.getAll();
      setCompetitions(res.data.competitions);
    } catch { toast.error("Failed to load competitions"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newComp.name.trim() || !newComp.paragraph.trim()) {
      toast.error("Name and paragraph are required"); return;
    }
    setCreating(true);
    try {
      await adminCompAPI.create({ name: newComp.name.trim(), paragraph: newComp.paragraph.trim(), timeLimit: 0 });
      toast.success("Competition created!");
      setNewComp({ name: "", paragraph: "", timeLimit: 0 });
      setShowCreate(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to create"); }
    finally { setCreating(false); }
  };

  const handleSetStatus = async (id: string, status: string) => {
    try {
      await adminCompAPI.setStatus(id, status);
      toast.success(`Competition set to ${status}`);
      if (status === "Ended" || status === "Active") {
        const socket = io(SOCKET_URL, { transports: ["websocket", "polling"], withCredentials: true });
        socket.on("connect", () => {
          if (status === "Ended") socket.emit("end_competition", { competitionId: id });
          if (status === "Active") socket.emit("start_competition", { competitionId: id });
          setTimeout(() => socket.disconnect(), 1000);
        });
      }
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to update status"); }
  };

  const startEdit = (c: Competition) => {
    setEditId(c._id);
    setEditState({ name: c.name, paragraph: c.paragraph || "", timeLimit: c.timeLimit });
  };

  const saveEdit = async (id: string) => {
    try {
      await adminCompAPI.update(id, { name: editState.name.trim(), paragraph: editState.paragraph.trim(), timeLimit: editState.timeLimit });
      toast.success("Competition updated");
      setEditId(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to update"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" and all its results?`)) return;
    try {
      await adminCompAPI.delete(id);
      toast.success("Competition deleted");
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isAdmin />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Competitions</h1>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="gradient-hero text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="h-4 w-4" /> New Competition
          </button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6"
            >
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-base">Create New Competition</h3>
                <div className="grid md:grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Competition Name</label>
                    <input
                      value={newComp.name}
                      onChange={e => setNewComp(p => ({ ...p, name: e.target.value }))}
                      placeholder="Speed Sprint"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600">Typing Paragraph</label>
                  <textarea
                    rows={4} value={newComp.paragraph}
                    onChange={e => setNewComp(p => ({ ...p, paragraph: e.target.value }))}
                    placeholder="Enter the text participants will type…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                  />
                  <p className="text-xs text-slate-400">{newComp.paragraph.length} characters</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCreate} disabled={creating}
                    className="gradient-hero text-white rounded-xl px-5 py-2 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
                  >
                    {creating ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Create Competition"}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="bg-slate-100 hover:bg-slate-200 rounded-xl px-5 py-2 text-sm font-semibold transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-10"><LogoLoader /></div>
        ) : competitions.length === 0 ? (
          <div className="card p-12 text-center text-slate-400"><div className="text-4xl mb-3">🏁</div>No competitions yet — create one above!</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Name","Participants","Status","Created","Actions"].map((h,i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide ${i===0?"text-left":"text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitions.map((comp) => (
                    <React.Fragment key={comp._id}>
                      <tr key={comp._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          {editId === comp._id ? (
                            <input value={editState.name} onChange={e => setEditState(p => ({ ...p, name: e.target.value }))}
                              className="border border-primary/30 rounded-lg px-2 py-1 text-sm w-full outline-none focus:ring-1 focus:ring-primary"
                            />
                          ) : (
                            <div>
                              <span className="font-semibold">{comp.name}</span>
                              <button onClick={() => setExpandedId(expandedId === comp._id ? null : comp._id)} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
                                {expandedId === comp._id ? <ChevronUp className="h-3.5 w-3.5 inline" /> : <ChevronDown className="h-3.5 w-3.5 inline" />}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          <span className="flex items-center justify-center gap-1"><Users className="h-3.5 w-3.5" />{comp.participantCount}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[comp.status]}`}>{comp.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">{new Date(comp.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {editId === comp._id ? (
                              <>
                                <button onClick={() => saveEdit(comp._id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                                <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X className="h-3.5 w-3.5" /></button>
                              </>
                            ) : (
                              <>
                                {comp.status === "Draft" && (
                                  <button onClick={() => startEdit(comp)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                                )}
                                {comp.status !== "Ended" && (
                                  <button onClick={() => handleSetStatus(comp._id, NEXT_STATUS[comp.status])}
                                    className={`p-1.5 rounded-lg transition-colors text-xs font-semibold px-3 flex items-center gap-1
                                      ${comp.status === "Draft"   ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : 
                                        comp.status === "Waiting" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : 
                                        "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}
                                  >
                                    {comp.status === "Draft"   ? <>Publish</> :
                                     comp.status === "Waiting" ? <><Play className="h-3 w-3"/> Start</> : 
                                     <><Square className="h-3 w-3"/> End</>}
                                  </button>
                                )}
                                {comp.status === "Ended" && (
                                  <button onClick={() => handleSetStatus(comp._id, "Draft")} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-xs font-semibold px-2">Reopen</button>
                                )}
                                {comp.status !== "Active" && (
                                  <button onClick={() => handleDelete(comp._id, comp.name)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedId === comp._id && (
                        <tr key={`${comp._id}-expand`} className="bg-slate-50 border-b border-slate-100">
                          <td colSpan={5} className="px-6 py-4">
                            {editId === comp._id ? (
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paragraph</label>
                                <textarea rows={4} value={editState.paragraph} onChange={e => setEditState(p => ({ ...p, paragraph: e.target.value }))}
                                  className="w-full border border-primary/30 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                                <p className="text-xs text-slate-400">{editState.paragraph.length} characters</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Paragraph</p>
                                <p className="text-sm text-slate-600 font-mono leading-relaxed bg-white border border-slate-100 rounded-xl p-4">{comp.paragraph}</p>
                                <p className="text-xs text-slate-400 mt-1">{comp.paragraph?.length ?? 0} characters</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
