import * as fs from 'fs';
import * as path from 'path';

export function loadEmailTemplate(
  templateName: string,
  variables: Record<string, string>
): string {
  // Detectar se estamos em produção usando NODE_ENV
  const isProduction = process.env.NODE_ENV === 'production';

  let templatePath: string;

  if (isProduction) {
    // Em produção: /var/www/gunno/production/track-okr-api/dist/shared/utils
    // Precisamos ir para: /var/www/gunno/production/track-okr-api/templates
    templatePath = path.join(__dirname, '../../../src/templates', templateName);
  } else {
    // Em desenvolvimento: /src/shared/utils
    // Vai para: /src/templates
    templatePath = path.join(__dirname, '../../templates', templateName);
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  // Substituir as variáveis no template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), value);
  }

  return template;
}

export function generateRandomPassword(length = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function truncateString(str: string, maxLength: number = 254): string {
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

export const currentQuarter = () => {
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  return currentQuarter;
};

export const Utils = {
  loadEmailTemplate,
  generateRandomPassword,
  truncateString,
  currentQuarter
};
