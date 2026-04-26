import React from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, getDocs } from 'firebase/firestore';
import { PropFirm, UserProfile } from '../types';
import { LayoutGrid, Users, Plus, Edit2, Trash2, ShieldCheck, XCircle, Loader2, Database, AlertCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Subscriber {
  id: string;
  email: string;
  createdAt: any;
  source: string;
}
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [firms, setFirms] = React.useState<PropFirm[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<'firms' | 'users' | 'subscribers'>('firms');
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<Partial<PropFirm>>({
    name: '',
    rating: 'medium',
    websiteUrl: '',
    startingBalance: '',
    profitSplit: '',
    maxLeverage: '',
    description: '',
    pros: [],
    cons: [],
  });
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    // Check if user is admin
    const unsubAdmin = onSnapshot(doc(db, 'admins', user.uid), (snapshot) => {
      const exists = snapshot.exists();
      setIsAdmin(exists);
      
      if (!exists) {
        setLoading(false);
      }
    }, (err) => {
      console.error("Admin verification failed:", err);
      setIsAdmin(false);
      setLoading(false);
    });

    return () => unsubAdmin();
  }, [user]);

  React.useEffect(() => {
    if (!user || !isAdmin) return;

    // Fetch Firms
    const unsubFirms = onSnapshot(query(collection(db, 'firms')), (snapshot) => {
      setFirms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropFirm)));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching firms:", err);
    });

    // Fetch Users
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserProfile)));
    }, (err) => {
      console.error("Error fetching users:", err);
    });

    // Fetch Subscribers
    const unsubSubscribers = onSnapshot(query(collection(db, 'subscribers'), orderBy('createdAt', 'desc')), (snapshot) => {
      setSubscribers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber)));
    }, (err) => {
      console.error("Error fetching subscribers:", err);
    });

    return () => {
      unsubFirms();
      unsubUsers();
      unsubSubscribers();
    };
  }, [user, isAdmin]);

  const handleSubmitFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.id || Math.random().toString(36).substring(7);
    const slug = form.name?.toLowerCase().replace(/\s+/g, '-');
    
    await setDoc(doc(db, 'firms', id), {
      ...form,
      id,
      slug,
      updatedAt: new Date().toISOString(),
    });
    
    setIsEditing(false);
    setForm({
      name: '',
      rating: 'medium',
      websiteUrl: '',
      startingBalance: '',
      profitSplit: '',
      maxLeverage: '',
      description: '',
      pros: [],
      cons: [],
    });
  };

  const handleDeleteFirm = async (id: string) => {
    if (confirm('Are you sure you want to delete this firm?')) {
      await deleteDoc(doc(db, 'firms', id));
    }
  };

  const handleDeleteAllReviews = async () => {
    if (!confirm('CRITICAL ACTION: This will permanently purge ALL audit logs across ALL firms. This cannot be undone. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      let totalDeleted = 0;
      for (const firm of firms) {
        const reviewsSnapshot = await getDocs(collection(db, 'firms', firm.id, 'reviews'));
        const deletePromises = reviewsSnapshot.docs.map(reviewDoc => 
          deleteDoc(doc(db, 'firms', firm.id, 'reviews', reviewDoc.id))
        );
        await Promise.all(deletePromises);
        totalDeleted += reviewsSnapshot.size;
      }
      alert(`System Purge Complete. Total Audit Logs Erased: ${totalDeleted}`);
    } catch (err) {
      console.error('Purge Failed:', err);
      alert('System Error during purge operation.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl max-w-lg text-center">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Access Restricted.</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Your terminal identity lacks necessary clearance for this protected layer. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 bg-zinc-950">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">Command<br />Center.</h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Global System Admin Mode
          </p>
        </div>
        <div className="flex flex-wrap gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button 
            onClick={handleDeleteAllReviews}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/20"
            title="Wipe ALL Reviews"
          >
            <AlertCircle size={14} /> Global Purge
          </button>
          <button 
            onClick={() => setTab('firms')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'firms' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid size={16} /> Asset Manager
          </button>
          <button 
            onClick={() => setTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'users' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <Users size={16} /> Network Nodes
          </button>
          <button 
            onClick={() => setTab('subscribers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'subscribers' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <Mail size={16} /> Lead Ops
          </button>
        </div>
      </div>

      {tab === 'firms' ? (
        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Active Database</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Add New Asset
            </button>
          </div>

          <div className="grid gap-4">
            {firms.map((firm) => (
              <div key={firm.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-3 h-12 rounded-full ${firm.rating === 'good' ? 'bg-emerald-500' : firm.rating === 'medium' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{firm.name}</h3>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">ID: {firm.id} // SLUG: {firm.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setForm(firm); setIsEditing(true); }}
                    className="p-3 bg-zinc-800 text-zinc-400 hover:text-emerald-500 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteFirm(firm.id)}
                    className="p-3 bg-zinc-800 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'users' ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Verified Identities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">UID Signature</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Email Terminal</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Alias</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-6 font-mono text-[10px] text-zinc-400">{u.uid}</td>
                    <td className="py-6 text-sm font-bold text-white">{u.email}</td>
                    <td className="py-6 text-sm font-bold text-emerald-500 italic uppercase">{u.displayName || 'ANONYMOUS'}</td>
                    <td className="py-6 text-[10px] font-mono text-zinc-500">{u.createdAt?.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Newsletter Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Log ID</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Email Terminal</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Source</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-6 font-mono text-[10px] text-zinc-400">{s.id.substring(0, 8)}...</td>
                    <td className="py-6 text-sm font-bold text-white">{s.email}</td>
                    <td className="py-6 text-xs font-bold text-emerald-500 uppercase italic">{s.source}</td>
                    <td className="py-6 text-[10px] font-mono text-zinc-500">
                      {s.createdAt?.toDate ? s.createdAt.toDate().toISOString().substring(0, 10) : 'Pending...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firm Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[3rem] p-12 overflow-y-auto max-h-[85vh] shadow-2xl"
            >
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-8">Asset Initialization.</h2>
              <form onSubmit={handleSubmitFirm} className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Firm Name</label>
                    <input 
                      type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-emerald-500 transition-colors outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Rating Channel</label>
                    <select 
                      value={form.rating} onChange={(e) => setForm({...form, rating: e.target.value as any})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="good text-emerald-500">GOOD (Tier 1)</option>
                      <option value="medium text-blue-500">MEDIUM (Tier 2)</option>
                      <option value="bad text-rose-500">BAD (High Risk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Max Balance</label>
                    <input 
                      type="text" value={form.startingBalance} onChange={(e) => setForm({...form, startingBalance: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-mono focus:border-emerald-500 outline-none"
                      placeholder="$200,000"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Website URL</label>
                    <input 
                      type="text" required value={form.websiteUrl} onChange={(e) => setForm({...form, websiteUrl: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Profit Split</label>
                    <input 
                      type="text" value={form.profitSplit} onChange={(e) => setForm({...form, profitSplit: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-emerald-500 outline-none"
                      placeholder="90%"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Asset Description</label>
                    <textarea 
                      rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button type="submit" className="flex-1 bg-white text-black font-black uppercase py-5 rounded-xl hover:bg-emerald-400 transition-colors tracking-widest">
                    SYNC_CHANGES
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-10 border border-zinc-800 text-zinc-500 font-black uppercase py-5 rounded-xl hover:text-white transition-all tracking-widest">
                    ABORT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
