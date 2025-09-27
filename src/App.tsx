import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';
import { auth } from './firebase';

// Páginas
import ArchivedOffers from './pages/ArchivedOffers'; // 1. Importar a nova página
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import OfferPage from './pages/OfferPage';
import SignUp from './pages/SignUp';

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
        <Route path="/" element={user ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/archived" element={user ? <ArchivedOffers /> : <Navigate to="/login" />} />{' '}
        {/* 2. Adicionar a nova rota protegida */}
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/oferta/:offerId" element={<OfferPage />} />
      </Routes>
    </>
  );
}

export default App;
