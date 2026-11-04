#!/bin/sh
set -e

echo "⏳ Aguardando banco de dados PostgreSQL estar pronto..."
node -e "
const net = require('net');
const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/os_melhores_da_cidade');
const host = url.hostname;
const port = parseInt(url.port || '5432', 10);

async function waitForDb() {
  for (let i = 0; i < 30; i++) {
    const isReady = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        resolve(false);
      });
      socket.setTimeout(2000, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (isReady) {
      console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
      process.exit(0);
    }
    console.log('Aguardando PostgreSQL... (' + (i + 1) + '/30)');
    await new Promise(r => setTimeout(r, 1000));
  }
  console.error('❌ Falha ao conectar ao PostgreSQL.');
  process.exit(1);
}
waitForDb();
"

echo "🚀 Executando migrações do Prisma (db push)..."
npx prisma db push --skip-generate

echo "🌱 Executando seed inicial da base de dados..."
npx ts-node prisma/seed.ts || true

echo "✨ Iniciando backend NestJS na porta 3333..."
if [ -f "dist/main.js" ]; then
  exec node dist/main.js
elif [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
else
  echo "❌ Arquivo main.js não encontrado em dist/ nem dist/src/"
  exit 1
fi


