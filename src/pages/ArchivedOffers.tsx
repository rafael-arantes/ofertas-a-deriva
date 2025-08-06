import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Componentes dos modais
import EditOfferModal from '../components/EditOfferModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import type { Offer } from '../components/OfferList'; // Reutilizando a interface

const ArchivedOffers = () => {
  const [user] = useAuthState(auth);
  const [archivedOffers, setArchivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offerPendingDeletion, setOfferPendingDeletion] = useState<Offer | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; };

    const q = query(collection(db, 'offers'), where('ownerId', '==', user.uid), where('isArchived', '==', true), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const offersData: Offer[] = [];
      querySnapshot.forEach((doc) => {
        offersData.push({ id: doc.id, ...doc.data() } as Offer);
      });
      setArchivedOffers(offersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleUnarchive = async (offerId: string) => {
    const offerRef = doc(db, 'offers', offerId);
    await updateDoc(offerRef, { isArchived: false });
    toast.success('Oferta restaurada!');
  };

  const handleOpenEditModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedOffer(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedOffer) return;

    const offerToDelete = selectedOffer;
    setOfferPendingDeletion(offerToDelete);
    handleCloseModals();

    const performDelete = async () => {
        try {
            const imageRef = ref(storage, offerToDelete.imageUrl);
            await deleteObject(imageRef);
            await deleteDoc(doc(db, 'offers', offerToDelete.id));
            toast.success('Oferta apagada permanentemente.');
        } catch (error) {
            console.error("Erro ao apagar oferta: ", error);
            toast.error('Falha ao apagar a oferta.');
            setOfferPendingDeletion(null);
        }
     };

     let deleteTimeout: NodeJS.Timeout;

     toast(
        (t) => (
            <div className="flex flex-col items-center gap-2">
                <span>Oferta apagada.</span>
                <button
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-md text-sm"
                    onClick={() => {
                        clearTimeout(deleteTimeout);
                        toast.dismiss(t.id);
                        setOfferPendingDeletion(null);
                        toast.success('Ação desfeita!', { duration: 4000 });
                    }}
                >
                    Desfazer
                </button>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className="bg-red-500 h-1.5 rounded-full animate-progress"></div>
                </div>
            </div>
        ),
        {
            duration: 30000,
            id: `delete-toast-${offerToDelete.id}`,
        }
     );
     
     deleteTimeout = setTimeout(() => {
        performDelete();
        setOfferPendingDeletion(null);
     }, 30000);
  };

  if (loading) { return <div className="text-center p-8">Carregando ofertas arquivadas...</div>; }

  const displayedOffers = archivedOffers.filter(offer => offer.id !== offerPendingDeletion?.id);

  return (
    <>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 30s linear forwards;
        }
      `}</style>
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Ofertas Arquivadas</h1>
            <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg">
              ← Voltar ao Dashboard
            </Link>
          </header>
          <main>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
              {displayedOffers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Você não possui ofertas arquivadas.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {displayedOffers.map((offer) => (
                    <li key={offer.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <img src={offer.imageUrl} alt={offer.productName} className="w-16 h-16 object-cover rounded-md flex-shrink-0 opacity-50" />
                      <div className="flex-grow">
                        <p className="font-semibold text-slate-500">{offer.productName}</p>
                        <p className="text-sm text-slate-400">{offer.productPrice}</p>
                      </div>
                      <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                        <button onClick={() => handleUnarchive(offer.id)} title="Restaurar" className="p-2 text-slate-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </button>
                        <button onClick={() => handleOpenDeleteModal(offer)} title="Apagar Permanentemente" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <EditOfferModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        offer={selectedOffer}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        isLoading={false}
      />
    </>
  );
};

export default ArchivedOffers;