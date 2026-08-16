import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Activity, Dumbbell, Home, ListChecks, Repeat, Salad, Scale, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './state/AuthContext.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Workouts } from './pages/Workouts.jsx';
import { Habits } from './pages/Habits.jsx';
import { Routines } from './pages/Routines.jsx';
import { Profile } from './pages/Profile.jsx';
import { Measurements } from './pages/Measurements.jsx';
import { Nutrition } from './pages/Nutrition.jsx';
import './styles.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/routines', label: 'Routines', icon: Repeat },
  { to: '/measurements', label: 'Measurements', icon: Scale },
  { to: '/nutrition', label: 'Nutrition', icon: Salad },
  { to: '/profile', label: 'Profile', icon: Settings }
];

function AppShell() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading QuickFit...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity size={28} />
          <div>
            <strong>QuickFit</strong>
            <span>{user.experienceLevel}</span>
          </div>
        </div>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" onClick={logout}>Log out</button>
      </aside>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
