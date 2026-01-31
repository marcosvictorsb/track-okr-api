export function generateRandomCnpj(): string {
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += base[i] * weights1[i];
  }
  const digit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 12; i++) {
    sum2 += base[i] * weights2[i];
  }
  sum2 += digit1 * weights2[12];
  const digit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return [...base, digit1, digit2].join('');
}

export function formatCnpj(cnpj: string): string {
  if (cnpj.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function validateCnpj(cnpj: string): boolean {
  const cleanedCnpj = cleanCnpj(cnpj);

  if (cleanedCnpj.length !== 14) {
    return false;
  }

  if (/^(\d)\1+$/.test(cleanedCnpj)) {
    return false;
  }

  const digits = cleanedCnpj.split('').map(Number);

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += digits[i] * weights1[i];
  }
  const expectedDigit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  if (digits[12] !== expectedDigit1) {
    return false;
  }

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += digits[i] * weights2[i];
  }
  const expectedDigit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return digits[13] === expectedDigit2;
}
