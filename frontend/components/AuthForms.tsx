import React, { useState } from 'react';
import { Button } from './Button';
import { Lock, User, Activity, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface AuthFormsProps {
    onSuccess: () => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await api.login(username, password);
            } else {
                await api.register(username, password);
                // Auto login after register
                await api.login(username, password);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message === "Unauthorized" ? "Ungültige Anmeldedaten" : "Ein Fehler ist aufgetreten. Benutzername evtl. vergeben?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary mb-4 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <Activity size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight text-center">
                        Soma
                    </h1>
                    <p className="text-zinc-500 text-sm mt-2 text-center">
                        {isLogin ? 'Willkommen zurück! Melde dich an.' : 'Erstelle ein Konto, um deinen Fortschritt zu speichern.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Benutzername"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-zinc-800 transition-all outline-none"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Passwort"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-zinc-800 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        variant="primary"
                        className="mt-6 rounded-xl shadow-lg shadow-primary/20 py-3.5"
                        disabled={loading}
                    >
                        {loading ? 'Laden...' : (isLogin ? 'Anmelden' : 'Registrieren')}
                        {!loading && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Anmelden'}
                    </button>
                </div>
            </div>
        </div>
    );
};