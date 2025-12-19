import React, { useEffect, useState } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { api } from './services/api';
import { Measurement } from './types';
import { EntryForm } from './components/EntryForm';
import { HistoryList } from './components/HistoryList';
import { ProgressChart } from './components/ProgressChart';
import { SummaryStats } from './components/SummaryStats';
import { AuthForms } from './components/AuthForms';

function App() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [entries, setEntries] = useState<Measurement[]>([]);
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingEntry, setEditingEntry] = useState<Measurement | null>(null);

  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    api.checkAuth()
      .then(u => {
        setUser(u);
        loadData();
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getMeasurements();
      setEntries(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Omit<Measurement, 'id'>) => {
    try {
      setLoading(true);
      if (editingEntry) {
        await api.updateMeasurement({ ...data, id: editingEntry.id });
      } else {
        await api.addMeasurement(data);
      }
      await loadData();
      setEditingEntry(null);
      setView('dashboard');
    } catch (e) {
      setError("Fehler beim Speichern");
      setLoading(false);
    }
  };

  const handleEditClick = (entry: Measurement) => {
    setEditingEntry(entry);
    setView('form');
  };

  const handleDelete = async () => {
    if (!editingEntry) return;
    try {
      setLoading(true);
      await api.deleteMeasurement(editingEntry.id);
      await loadData();
      setEditingEntry(null);
      setView('dashboard');
    } catch (e) {
      setError("Fehler beim Löschen");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setEntries([]);
  };

  if (authChecking) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Lade...</div>;
  }

  if (!user) {
    return <AuthForms onSuccess={() => {
      api.checkAuth().then(u => { setUser(u); loadData(); });
    }} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary/30 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Soma
          </h1>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Abmelden">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-0">
        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 p-4 rounded-2xl text-sm max-w-xl mx-auto">
            {error}
          </div>
        )}

        {view === 'form' ? (
          <div className="max-w-xl mx-auto">
            <EntryForm
              key={editingEntry ? editingEntry.id : 'new'}
              initialData={editingEntry || undefined}
              onSubmit={handleSave}
              onCancel={handleCancel}
              onDelete={editingEntry ? handleDelete : undefined}
            />
          </div>
        ) : (
          <>
            {loading && entries.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">Lade Daten...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column: Stats and Chart */}
                <div className="space-y-6 lg:space-y-8">
                  <SummaryStats entries={entries} />
                  <section>
                    <ProgressChart data={entries} />
                  </section>
                </div>

                {/* Right Column: History */}
                <div>
                  <section>
                    <HistoryList entries={entries} onEdit={handleEditClick} />
                  </section>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {view === 'dashboard' && (
        <div className="fixed inset-x-0 bottom-6 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-end">
            <button
              onClick={() => { setEditingEntry(null); setView('form'); }}
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 pointer-events-auto"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Plus size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;