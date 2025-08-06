import { collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { auth, db, storage } from '../firebase';

// Componentes dos modais
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditOfferModal from './EditOfferModal';

// Exportando a interface para ser usada no EditOfferModal
export interface Offer {
  id: string;
  productName: string;
  productPrice: string;
  affiliateLink: string;
  imageUrl: string;
  ownerId: string;
  createdAt: Timestamp;
}

const OfferList = () => {
  const [user] = useAuthState(auth);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar os modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Novo estado para a UI otimista de exclusão
  const [offerPendingDeletion, setOfferPendingDeletion] = useState<Offer | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'offers'),
      where('ownerId', '==', user.uid),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const offersData: Offer[] = [];
        querySnapshot.forEach((doc) => {
          offersData.push({ id: doc.id, ...doc.data() } as Offer);
        });
        setOffers(offersData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar ofertas: ', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleArchive = async (offerId: string) => {
    const offerRef = doc(db, 'offers', offerId);
    await updateDoc(offerRef, { isArchived: true });
    toast.success('Oferta arquivada!');
  };

  const copyLink = (offerId: string) => {
    const link = `${window.location.origin}/oferta/${offerId}`;

    const textArea = document.createElement('textarea');
    textArea.value = link;

    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Link copiado com sucesso!');
      } else {
        toast.error('Falha ao copiar o link.');
      }
    } catch (err) {
      console.error('Falha ao copiar:', err);
      toast.error('Falha ao copiar o link.');
    }

    document.body.removeChild(textArea);
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

    // 1. UI Otimista: remove a oferta da lista visível
    setOfferPendingDeletion(offerToDelete);
    handleCloseModals();

    // Função que executa a exclusão real
    const performDelete = async () => {
      try {
        const imageRef = ref(storage, offerToDelete.imageUrl);
        await deleteObject(imageRef);
        await deleteDoc(doc(db, 'offers', offerToDelete.id));
        toast.success('Oferta apagada permanentemente.');
      } catch (error) {
        console.error('Erro ao apagar oferta: ', error);
        toast.error('Falha ao apagar a oferta.');
        setOfferPendingDeletion(null);
      }
    };

    let deleteTimeout: NodeJS.Timeout;

    // 2. Mostra o toast com a opção de desfazer
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
              // CORREÇÃO APLICADA: Removido o ID estático
              toast.success('Ação desfeita!', {
                duration: 4000,
              });
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
        id: `delete-toast-${offerToDelete.id}`, // ID único para o toast de exclusão
      }
    );

    // 3. Agenda a exclusão real para daqui a 30 segundos
    deleteTimeout = setTimeout(() => {
      performDelete();
      setOfferPendingDeletion(null);
    }, 30000);
  };

  if (loading) {
    return <p className="text-center mt-8 text-slate-500">Carregando suas ofertas...</p>;
  }

  const displayedOffers = offers.filter((offer) => offer.id !== offerPendingDeletion?.id);

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

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Minhas Ofertas</h2>
        {displayedOffers.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Você ainda não criou nenhuma oferta.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {displayedOffers.map((offer) => (
              <li key={offer.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <img
                  src={offer.imageUrl}
                  alt={offer.productName}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-slate-800">{offer.productName}</p>
                  <p className="text-sm text-slate-500">R$ {offer.productPrice}</p>
                </div>
                <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                  <button
                    onClick={() => handleArchive(offer.id)}
                    title="Arquivar"
                    className="p-2 text-slate-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h12"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => copyLink(offer.id)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(offer)}
                    className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(offer)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <EditOfferModal isOpen={isEditModalOpen} onClose={handleCloseModals} offer={selectedOffer} />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        isLoading={false} // O modal não precisa mais de um estado de loading
      />
    </>
  );
};

export default OfferList;
