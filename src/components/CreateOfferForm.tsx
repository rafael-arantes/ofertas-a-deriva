import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, storage, auth } from '../firebase';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

const CreateOfferForm = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOfferLink, setCreatedOfferLink] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setProductPrice(formattedValue);
  };

  const copyToClipboard = () => {
    if (!createdOfferLink) return;

    const textArea = document.createElement("textarea");
    textArea.value = createdOfferLink;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productName || !productPrice || !affiliateLink || !imageFile) {
      setError("Por favor, preencha todos os campos e selecione uma imagem.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError("Você precisa estar logado para criar uma oferta.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCreatedOfferLink(null);

    const toastId = toast.loading('Criando oferta...');

    try {
      const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      const docRef = await addDoc(collection(db, 'offers'), {
        ownerId: user.uid,
        productName,
        productPrice,
        affiliateLink,
        imageUrl,
        createdAt: Timestamp.now(),
        isArchived: false,
      });
      
      const newOfferLink = `${window.location.origin}/oferta/${docRef.id}`;
      setCreatedOfferLink(newOfferLink);
      
      toast.success('Oferta criada!', { id: toastId });

      setProductName('');
      setProductPrice('');
      setAffiliateLink('');
      setImageFile(null);
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error("Erro ao criar oferta:", err);
      setError("Ocorreu um erro ao criar a oferta. Tente novamente.");
      toast.error('Falha ao criar oferta.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-2xl mx-auto mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-700">Criar nova oferta</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        {createdOfferLink && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Oferta criada com sucesso!</strong>
            <p className="block sm:inline mt-2">Seu link para compartilhar é:</p>
            <div className="flex items-center mt-2">
              <input type="text" readOnly value={createdOfferLink} className="w-full bg-white p-2 rounded border border-green-300 focus:outline-none" />
              <button type="button" onClick={copyToClipboard} className="ml-2 flex-shrink-0 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded">
                Copiar
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Nome do produto</label>
            <input type="text" id="productName" value={productName} onChange={e => setProductName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Preço</label>
            <input 
              type="text" 
              id="productPrice" 
              value={productPrice} 
              onChange={handlePriceChange} 
              placeholder="R$ 0,00"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700">Link de afiliado</label>
          <input type="url" id="affiliateLink" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://..." />
        </div>

        <div className="mb-6">
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Imagem do produto</label>
          <input type="file" id="imageFile" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 cursor-pointer text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
          {isLoading ? 'Criando...' : 'Criar oferta'}
        </button>
      </form>
    </div>
  );
};

export default CreateOfferForm;