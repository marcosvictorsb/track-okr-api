#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(
  `${colors.cyan}${colors.bold}🔍 Verificando variáveis de ambiente...${colors.reset}\n`
);

// Função para extrair variáveis de ambiente de um arquivo
function extractEnvVars(content, filePath) {
  const envVars = new Set();

  // Regex para encontrar process.env.VARIAVEL
  const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  let match;

  while ((match = processEnvRegex.exec(content)) !== null) {
    envVars.add({
      name: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length
    });
  }

  return envVars;
}

// Função para percorrer recursivamente a pasta src/
function walkDirectory(dir, fileExtensions = ['.ts', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Pular node_modules e outras pastas irrelevantes
      if (!['node_modules', '.git', 'dist', 'coverage'].includes(file)) {
        results = results.concat(walkDirectory(filePath, fileExtensions));
      }
    } else {
      // Verificar apenas arquivos com extensões relevantes
      if (fileExtensions.some((ext) => filePath.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Função para ler arquivo .env
function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    console.log(
      `${colors.red}❌ Arquivo .env não encontrado em: ${envPath}${colors.reset}`
    );
    return new Set();
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = new Set();

  envContent.split('\n').forEach((line) => {
    line = line.trim();
    // Ignorar comentários e linhas vazias
    if (line && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        envVars.add(key.trim());
      }
    }
  });

  return envVars;
}

// Caminhos
const srcPath = path.join(__dirname, '../src');
const envPath = path.join(__dirname, '../.env');

// Verificar se a pasta src existe
if (!fs.existsSync(srcPath)) {
  console.log(
    `${colors.red}❌ Pasta src/ não encontrada em: ${srcPath}${colors.reset}`
  );
  process.exit(1);
}

console.log(
  `${colors.blue}📂 Analisando arquivos em: ${srcPath}${colors.reset}`
);
console.log(
  `${colors.blue}📄 Verificando .env em: ${envPath}${colors.reset}\n`
);

// Obter todos os arquivos TypeScript e JavaScript na pasta src/
const files = walkDirectory(srcPath, ['.ts', '.js']);
console.log(
  `${colors.magenta}📊 Encontrados ${files.length} arquivos para análise${colors.reset}\n`
);

// Extrair todas as variáveis de ambiente usadas no código
const usedEnvVars = new Map(); // Map para armazenar var -> [arquivos que usam]

files.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const envVars = extractEnvVars(content, filePath);

    envVars.forEach((envVar) => {
      if (!usedEnvVars.has(envVar.name)) {
        usedEnvVars.set(envVar.name, []);
      }
      usedEnvVars.get(envVar.name).push({
        file: path.relative(process.cwd(), envVar.file),
        line: envVar.line
      });
    });
  } catch (error) {
    console.log(
      `${colors.yellow}⚠️  Erro ao ler arquivo ${filePath}: ${error.message}${colors.reset}`
    );
  }
});

// Ler variáveis definidas no .env
const definedEnvVars = readEnvFile(envPath);

// Relatório
console.log(
  `${colors.bold}📋 RELATÓRIO DE VARIÁVEIS DE AMBIENTE:${colors.reset}\n`
);

console.log(
  `${colors.cyan}🔧 Variáveis encontradas no código: ${usedEnvVars.size}${colors.reset}`
);
console.log(
  `${colors.cyan}📝 Variáveis definidas no .env: ${definedEnvVars.size}${colors.reset}\n`
);

// Verificar variáveis não definidas
const missingVars = [];
const existingVars = [];

usedEnvVars.forEach((locations, varName) => {
  if (definedEnvVars.has(varName)) {
    existingVars.push({ name: varName, locations });
  } else {
    missingVars.push({ name: varName, locations });
  }
});

// Mostrar variáveis que existem
if (existingVars.length > 0) {
  console.log(
    `${colors.green}${colors.bold}✅ VARIÁVEIS DEFINIDAS CORRETAMENTE (${existingVars.length}):${colors.reset}`
  );
  existingVars.forEach(({ name, locations }) => {
    console.log(`  ${colors.green}${name}${colors.reset}`);
    locations.slice(0, 3).forEach((loc) => {
      console.log(`    📁 ${loc.file}:${loc.line}`);
    });
    if (locations.length > 3) {
      console.log(
        `    ${colors.yellow}... e mais ${locations.length - 3} arquivo(s)${colors.reset}`
      );
    }
  });
  console.log();
}

// Mostrar variáveis faltando
if (missingVars.length > 0) {
  console.log(
    `${colors.red}${colors.bold}❌ VARIÁVEIS FALTANDO NO .env (${missingVars.length}):${colors.reset}`
  );
  missingVars.forEach(({ name, locations }) => {
    console.log(`  ${colors.red}${colors.bold}${name}${colors.reset}`);
    locations.forEach((loc) => {
      console.log(`    📁 ${loc.file}:${loc.line}`);
    });
  });
  console.log();
}

// Verificar variáveis definidas mas não utilizadas
const unusedVars = [];
definedEnvVars.forEach((varName) => {
  if (!usedEnvVars.has(varName)) {
    unusedVars.push(varName);
  }
});

if (unusedVars.length > 0) {
  console.log(
    `${colors.yellow}${colors.bold}⚠️  VARIÁVEIS DEFINIDAS MAS NÃO UTILIZADAS (${unusedVars.length}):${colors.reset}`
  );
  unusedVars.forEach((varName) => {
    console.log(`  ${colors.yellow}${varName}${colors.reset}`);
  });
  console.log();
}

// Resultado final
console.log(`${colors.bold}📊 RESUMO:${colors.reset}`);
console.log(
  `  ${colors.green}✅ Definidas corretamente: ${existingVars.length}${colors.reset}`
);
console.log(
  `  ${colors.red}❌ Faltando no .env: ${missingVars.length}${colors.reset}`
);
console.log(
  `  ${colors.yellow}⚠️  Não utilizadas: ${unusedVars.length}${colors.reset}`
);

// Exit code baseado no resultado
if (missingVars.length > 0) {
  console.log(
    `\n${colors.red}${colors.bold}💥 BUILD FALHOU: Existem variáveis de ambiente não definidas!${colors.reset}`
  );
  console.log(
    `${colors.red}👉 Por favor, adicione as variáveis faltando no arquivo .env${colors.reset}`
  );
  process.exit(1);
} else {
  console.log(
    `\n${colors.green}${colors.bold}🎉 BUILD OK: Todas as variáveis de ambiente estão definidas!${colors.reset}`
  );
  process.exit(0);
}
