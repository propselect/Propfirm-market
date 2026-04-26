import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import FirmsList from './pages/FirmsList';
import FirmDetail from './pages/FirmDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import MyReviews from './pages/MyReviews';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/firms" element={<FirmsList />} />
          <Route path="/firms/:slug" element={<FirmDetail />} />
          <Route path="/login" element={user ? <Navigate to="/firms" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/firms" /> : <Signup />} />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/my-audits" element={user ? <MyReviews /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
