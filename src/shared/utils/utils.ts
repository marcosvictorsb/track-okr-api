import * as fs from 'fs';
import * as path from 'path';

export function loadEmailTemplate(templateName: string, variables: Record<string, string>): string {
  const templatePath = path.join(__dirname, '../../templates', templateName);
  let template = fs.readFileSync(templatePath, 'utf8');

  // Substituir as variáveis no template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), value);
  }

  return template;
}

export function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}


export const Utils = {
  loadEmailTemplate,
  generateRandomPassword
};