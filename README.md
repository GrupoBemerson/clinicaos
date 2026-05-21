# ClinicaOS — Fundação

Estrutura monorepo com `frontend` (React + TypeScript + Tailwind) e `backend` (Node.js + Express + TypeScript + Prisma).

Passos rápidos:

1. Backend

```bash
cd backend
npm install
# configurar DATABASE_URL e JWT_SECRET em .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend está configurado para proxy `/api` => `http://localhost:4000`.

O que falta para deployment real
1) Backend não está pronto para “subir direto” no Vercel
O backend é um servidor Express tradicional em backend.
Vercel espera frontend estático ou funções serverless; o projeto não está estruturado para isso ainda.
Para rodar tudo no Vercel você precisaria:
mover o backend para api/ como funções Vercel, ou
hospedar o backend separadamente em outro serviço (Render, Railway, Fly, DigitalOcean, etc.)
2) Banco de dados precisa ser público/hosteado
Hoje você usa .env local com DATABASE_URL.
Para deploy, você precisa um PostgreSQL online e configurar DATABASE_URL no ambiente de produção.
3) O frontend está usando proxy local
vite.config.ts faz proxy /api → http://localhost:4000
Isso funciona só em desenvolvimento local.
Para produção, o frontend precisa apontar para a URL do backend real.
Conclusão
Não é ainda um MVP totalmente pronto para “subir no Vercel e rodar o site” como está.

Mas sim, ele está próximo:

o frontend pode ser buildado em Vercel
o backend precisa ser hospedado separadamente ou refatorado para serverless
é necessário configurar variáveis de ambiente e URL da API
Se quiser, posso te orientar no próximo passo:

fazer deploy do frontend no Vercel,
hospedar o backend em um serviço Node + PostgreSQL,
ajustar a URL da API para produção.