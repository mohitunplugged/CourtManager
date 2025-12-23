import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { apiBase } from '../lib/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [sessionState, setSessionState] = useState({ players: [], schedule: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Connect to Backend (Dynamic for Dev vs Prod)
    const serverURL = apiBase || (import.meta.env.DEV ? 'http://localhost:3000' : undefined);
    const newSocket = io(serverURL, {
        // Vercel requires this path for Socket.io to work correctly
        path: "/socket.io"
    });
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('state_update', (data) => {
        setSessionState(data);
    });

    newSocket.on('login_success', (user) => {
        setCurrentUser(user);
        sessionStorage.setItem('court_user', JSON.stringify(user));
    });

    // Auto-login if session exists
    const saved = sessionStorage.getItem('court_user');
    if (saved) {
        const u = JSON.parse(saved);
        if (u && u.id) {
             newSocket.on('connect', () => {
                 newSocket.emit('login', { id: u.id });
             });
        }
    }

    return () => newSocket.close();
  }, []);

  const login = (id) => {
      if (socket) socket.emit('login', { id });
  };

  const logout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('court_user');
  };

  const toggleStatus = (userId) => {
      if (socket) socket.emit('toggle_status', { userId });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sessionState, currentUser, login, logout, toggleStatus }}>
      {children}
    </SocketContext.Provider>
  );
};
