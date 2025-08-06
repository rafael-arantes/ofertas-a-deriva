import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// CORREÇÃO APLICADA AQUI:
import { doc, getDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore'; // Importando o tipo separadamente
import { db } from '../firebase';

// A interface para os dados da oferta permanece a mesma
interface OfferData {
  productName: string;
  productPrice: string;
  affiliateLink: string;
  imageUrl: string;
  isArchived?: boolean; // Campo opcional
}

const OfferPage = () => {
  // O hook useParams pega os parâmetros da URL, como o :offerId
  const { offerId } = useParams<{ offerId: string }>();
  
  // O estado agora pode ser OfferData ou null
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não houver offerId na URL, encerramos cedo.
    if (!offerId) {
      setError("ID da oferta não fornecido na URL.");
      setLoading(false);
      return;
    }

    const fetchOffer = async () => {
      // Garantimos que o estado de loading seja resetado a cada nova busca
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, 'offers', offerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as OfferData;
          // 1. Se a oferta estiver arquivada, trata como não encontrada
          if (data.isArchived) {
            setError("Esta oferta não está mais disponível.");
          } else {
            setOffer(data);
          }
        } else {
          // Se o documento não existe, definimos um erro claro
          setError("Oferta não encontrada ou expirada.");
          setOffer(null); // Garantimos que nenhuma oferta antiga seja exibida
        }
      } catch (err) {
        console.error("Erro ao buscar oferta:", err);
        setError("Ocorreu um erro ao carregar a oferta.");
        setOffer(null);
      } finally {
        // Independentemente do resultado, a busca terminou
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]); // O efeito roda sempre que o offerId da URL mudar

  // Estado de Carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-slate-500">Carregando oferta...</p>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-bold">Ocorreu um erro</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Estado de Sucesso (Renderização da Oferta)
  // Verificamos se 'offer' não é nulo antes de tentar renderizar
  if (offer) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <img className="w-full h-80 object-cover" src={offer.imageUrl} alt={offer.productName} />
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{offer.productName}</h1>
            <p className="text-4xl font-light text-slate-900 mb-8">R$ {offer.productPrice}</p>
            <a
              href={offer.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Ver Oferta na Loja
            </a>
          </div>
          <footer className="text-center py-4 bg-slate-50">
            <p className="text-xs text-slate-400">Powered by Seu App de Ofertas</p>
          </footer>
        </div>
      </div>
    );
  }

  // Fallback: Se não estiver carregando, não tiver erro, mas a oferta for nula
  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Nenhuma oferta para exibir.</p>
      </div>
  );
};

export default OfferPage;