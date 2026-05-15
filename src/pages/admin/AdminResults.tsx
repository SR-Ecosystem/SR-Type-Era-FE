import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter, RefreshCw } from "lucide-react";
import Navbar from "../../components/Navbar";
import { adminResultAPI, adminCompAPI } from "../../api/services";
import { AdminResult, Competition } from "../../utils/types";
import LogoLoader from "../../components/LogoLoader";
import toast from "react-hot-toast";

export default function AdminResults() {
  const [results,      setResults]      = useState<AdminResult[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);

  const loadComps = useCallback(async () => {
    try {
      const res = await adminCompAPI.getAll();
      setCompetitions(res.data.competitions);
    } catch {}
  }, []);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedComp) params.competitionId = selectedComp;
      const res = await adminResultAPI.getAll(params);
      setResults(res.data.results);
    } catch { toast.error("Failed to load results"); }
    finally { setLoading(false); }
  }, [selectedComp]);

  useEffect(() => { loadComps(); }, [loadComps]);
  useEffect(() => { loadResults(); }, [loadResults]);

  const filtered = results.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
               r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminResultAPI.exportCsv(selectedComp || undefined);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = selectedComp ? `comp-${selectedComp}-results.csv` : "all-results.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch (err: any) { toast.error(err.message || "Export failed"); }
    finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isAdmin />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Competition Results</h1>
          <div className="flex items-center gap-2">
            <button onClick={loadResults} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {exporting
                ? <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                : <Download className="h-4 w-4" />}
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <button
              onClick={() => setSelectedComp("")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!selectedComp ? "gradient-hero text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              All
            </button>
            {competitions.map(c => (
              <button key={c._id}
                onClick={() => setSelectedComp(c._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedComp === c._id ? "gradient-hero text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search student…"
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 w-52 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-10"><LogoLoader /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <div className="text-4xl mb-3">📋</div>
            {search ? "No results match your search." : "No results yet for this competition."}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              {selectedComp && competitions.find(c => c._id === selectedComp) && (
                <span className="text-xs bg-primary/10 text-primary-light px-2 py-0.5 rounded-full font-semibold">
                  {competitions.find(c => c._id === selectedComp)?.name}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    {["Rank","Student","Competition","WPM","Accuracy","Mistakes","Time","Completed"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide ${i < 2 ? "text-left" : "text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr key={r._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-primary-light">#{r.rank}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold flex items-center gap-1.5">
                          {r.name || "—"}
                          {r.rank === 1 && <span>🥇</span>}
                        </div>
                        <div className="text-xs text-slate-400">{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{r.competition || "—"}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-primary-light">{r.wpm}</td>
                      <td className="px-4 py-3 text-center font-mono">{r.accuracy}%</td>
                      <td className="px-4 py-3 text-center font-mono text-red-500">{r.mistakes}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{r.timeTakenFormatted || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {r.completed
                          ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Yes</span>
                          : <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">No</span>}
                      </td>
                    </motion.tr>
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
