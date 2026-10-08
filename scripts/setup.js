const { randomBytes } = require('crypto');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

const projectFolder = path.resolve(__dirname, '..');
const envFile = path.join(projectFolder, '.env');

if (existsSync(envFile)) {
  console.log('O arquivo .env já existe.');
} else {
  const example = readFileSync(path.join(projectFolder, '.env.example'), 'utf8');
  const secret = randomBytes(32).toString('hex');
  writeFileSync(envFile, example.replace('JWT_SECRET=', `JWT_SECRET=${secret}`));
  console.log('Arquivo .env criado.');
}
