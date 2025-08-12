/**
 * Gera um CNPJ aleatório válido
 * @returns string - CNPJ no formato 14 dígitos
 */
export function generateRandomCnpj(): string {
  // Gera os primeiros 12 dígitos aleatoriamente
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

  // Calcula o primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += base[i] * weights1[i];
  }
  const digit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  // Calcula o segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 12; i++) {
    sum2 += base[i] * weights2[i];
  }
  sum2 += digit1 * weights2[12];
  const digit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  // Retorna o CNPJ completo
  return [...base, digit1, digit2].join('');
}

/**
 * Formata um CNPJ adicionando máscara
 * @param cnpj string - CNPJ com 14 dígitos
 * @returns string - CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export function formatCnpj(cnpj: string): string {
  if (cnpj.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Remove formatação do CNPJ, deixando apenas números
 * @param cnpj string - CNPJ formatado ou não
 * @returns string - CNPJ apenas com números
 */
export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Valida se um CNPJ é válido
 * @param cnpj string - CNPJ para validar
 * @returns boolean - true se válido
 */
export function validateCnpj(cnpj: string): boolean {
  const cleanedCnpj = cleanCnpj(cnpj);

  if (cleanedCnpj.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanedCnpj)) {
    return false;
  }

  const digits = cleanedCnpj.split('').map(Number);

  // Valida primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += digits[i] * weights1[i];
  }
  const expectedDigit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  if (digits[12] !== expectedDigit1) {
    return false;
  }

  // Valida segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += digits[i] * weights2[i];
  }
  const expectedDigit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return digits[13] === expectedDigit2;
}
