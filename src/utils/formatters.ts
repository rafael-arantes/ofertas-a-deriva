export const formatCurrency = (value: string): string => {
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  // Converte a string de dígitos para um número, dividindo por 100
  const numberValue = Number(digitsOnly) / 100;

  // Formata o número para o padrão BRL
  const formattedValue = numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return formattedValue;
};