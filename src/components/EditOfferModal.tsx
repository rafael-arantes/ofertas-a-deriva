import { doc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { db, storage } from '../firebase';
import { formatCurrency } from '../utils/formatters';
import type { Offer } from './OfferList';

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({ isOpen, onClose, offer }) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      setProductName(offer.productName);
      setProductPrice(offer.productPrice);
      setAffiliateLink(offer.affiliateLink);
      setCurrentImageUrl(offer.imageUrl);
    }
  }, [offer]);

  if (!isOpen || !offer) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setProductPrice(formattedValue);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = currentImageUrl;

      if (imageFile) {
        const oldImageRef = ref(storage, currentImageUrl);
        await deleteObject(oldImageRef).catch((err) => console.error('Falha ao apagar imagem antiga:', err));

        const newImageRef = ref(storage, `images/${offer.ownerId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(newImageRef, imageFile);
        imageUrl = await getDownloadURL(newImageRef);
      }

      const offerRef = doc(db, 'offers', offer.id);
      await updateDoc(offerRef, {
        productName,
        productPrice,
        affiliateLink,
        imageUrl,
      });

      toast.success('Oferta atualizada com sucesso!');
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar oferta:', err);
      setError('Falha ao atualizar a oferta. Tente novamente.');
      toast.error('Falha ao atualizar a oferta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Editar Oferta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="editProductName" className="block text-sm font-medium text-slate-600">
                Nome do Produto
              </label>
              <input
                type="text"
                id="editProductName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="editProductPrice" className="block text-sm font-medium text-slate-600">
                Preço
              </label>
              <input
                type="text"
                id="editProductPrice"
                value={productPrice}
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
                className="mt-1 block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="editAffiliateLink" className="block text-sm font-medium text-slate-600">
              Link de Afiliado
            </label>
            <input
              type="url"
              id="editAffiliateLink"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Imagem do Produto</label>
            {currentImageUrl && (
              <img src={currentImageUrl} alt="Imagem atual" className="w-20 h-20 object-cover rounded-md my-2" />
            )}
            <input
              type="file"
              id="editImageFile"
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">Selecione uma nova imagem para substituí-la.</p>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOfferModal;
