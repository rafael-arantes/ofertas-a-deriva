import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { Toaster } from 'react-hot-toast';

// Páginas
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OfferPage from './pages/OfferPage';
import ForgotPassword from './pages/ForgotPassword';
import ArchivedOffers from './pages/ArchivedOffers'; // 1. Importar a nova página

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error('Erro ao fazer logout:', error));
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={ user ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/login" /> } />
        <Route path="/archived" element={ user ? <ArchivedOffers /> : <Navigate to="/login" /> } /> {/* 2. Adicionar a nova rota protegida */}
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/oferta/:offerId" element={<OfferPage />} />
      </Routes>
    </>
  );
}

export default App;