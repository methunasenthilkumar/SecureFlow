import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import SubmitTransaction from './pages/customer/SubmitTransaction';
import TransactionHistory from './pages/customer/TransactionHistory';
import Profile from './pages/customer/Profile';

// Analyst Pages
import AnalystDashboard from './pages/analyst/AnalystDashboard';
import PendingReviews from './pages/analyst/PendingReviews';
import ReviewHistory from './pages/analyst/ReviewHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ThresholdConfig from './pages/admin/ThresholdConfig';
import AuditLogs from './pages/admin/AuditLogs';
import Reports from './pages/admin/Reports';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to user's home dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'analyst') return <Navigate to="/analyst/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'analyst') return <Navigate to="/analyst/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Customer Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <MainLayout><CustomerDashboard /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/submit"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <MainLayout><SubmitTransaction /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/transactions"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <MainLayout><TransactionHistory /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <MainLayout><Profile /></MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fraud Analyst Routes */}
              <Route
                path="/analyst/dashboard"
                element={
                  <ProtectedRoute roles={['analyst', 'admin']}>
                    <MainLayout><AnalystDashboard /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyst/pending"
                element={
                  <ProtectedRoute roles={['analyst', 'admin']}>
                    <MainLayout><PendingReviews /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyst/history"
                element={
                  <ProtectedRoute roles={['analyst', 'admin']}>
                    <MainLayout><ReviewHistory /></MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <MainLayout><AdminDashboard /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <MainLayout><ManageUsers /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/threshold"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <MainLayout><ThresholdConfig /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <MainLayout><AuditLogs /></MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <MainLayout><Reports /></MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
