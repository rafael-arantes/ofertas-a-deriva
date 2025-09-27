import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h3 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h3>
        <p className="text-slate-600 mt-2 mb-6">Você tem certeza que deseja apagar esta oferta? Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} disabled={isLoading} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
            {isLoading ? 'Apagando...' : 'Apagar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;