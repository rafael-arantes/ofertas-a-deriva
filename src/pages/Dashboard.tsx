import React from 'react';
import { Link } from 'react-router-dom'; // 1. Importar Link
import CreateOfferForm from '../components/CreateOfferForm';
import OfferList from '../components/OfferList';

interface DashboardProps {
  handleLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ handleLogout }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* 2. Adicionar link para a página de arquivados */}
            <Link to="/archived" className="text-sm text-slate-600 hover:text-slate-900">
              Ver Arquivados
            </Link>
            <button
              onClick={handleLogout}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg"
            >
              Sair
            </button>
          </div>
        </header>
        
        <main className="space-y-12">
          <CreateOfferForm />
          <OfferList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;