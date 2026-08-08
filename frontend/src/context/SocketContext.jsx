import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toastAlerts, setToastAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join user specific room
      socket.emit('join_user_room', user._id);

      if (user.role === 'analyst') {
        socket.emit('join_analysts_room');
      } else if (user.role === 'admin') {
        socket.emit('join_admin_room');
      }

      // Listen for events
      socket.on('transaction_status_changed', (data) => {
        addToast({
          id: Date.now(),
          type: data.status === 'APPROVED' ? 'success' : data.status === 'REJECTED' ? 'error' : 'warning',
          title: `Transaction ${data.transactionId} Status Update`,
          message: `Status is now ${data.status}.`
        });
      });

      socket.on('new_fraud_alert', (data) => {
        addToast({
          id: Date.now(),
          type: 'error',
          title: '🚨 High Risk Fraud Alert!',
          message: `Transaction ${data.transactionId} (₹${data.amount}) flagged with Risk Score ${data.riskScore}/100.`
        });
      });

      socket.on('analyst_decision_made', (data) => {
        addToast({
          id: Date.now(),
          type: data.decision === 'APPROVED' ? 'success' : 'error',
          title: 'Analyst Action Completed',
          message: `Analyst ${data.analystName} marked ${data.transactionId} as ${data.decision}.`
        });
      });
    }
  }, [socket, user]);

  const addToast = (toast) => {
    setToastAlerts(prev => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(toast.id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToastAlerts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, toastAlerts, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toastAlerts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl backdrop-blur-lg border transition-all duration-300 transform translate-x-0 ${
              t.type === 'error'
                ? 'bg-rose-950/90 border-rose-600/50 text-rose-100 shadow-rose-900/30'
                : t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600/50 text-emerald-100 shadow-emerald-900/30'
                : 'bg-amber-950/90 border-amber-600/50 text-amber-100 shadow-amber-900/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm tracking-wide">{t.title}</h4>
                <p className="text-xs mt-1 text-slate-200">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white text-xs ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
