import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Se um e-mail cadastrado for encontrado, um link para redefinir a senha será enviado.', {
        duration: 6000,
      });
      setEmail('');
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      // Mostramos a mesma mensagem de sucesso por segurança, para não confirmar se um e-mail existe ou não.
      toast.success('Se um e-mail cadastrado for encontrado, um link para redefinir a senha será enviado.', {
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Recuperar Senha</h2>
        <p className="text-slate-600 mb-8">Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400"
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </div>
        </form>
        <p className="text-center text-slate-500 text-sm mt-8">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-bold text-green-500 hover:text-green-600">
            Faça Login →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;