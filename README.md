# 💰 Meu Verdin

Sistema de gestão financeira pessoal focado em Orçado vs. Realizado. O acesso do MVP é exclusivo com Google OAuth.

## 🛠 Tech Stack

Este projeto utiliza uma arquitetura Next.js Fullstack moderna e performática com Node.js + npm.

| Camada | Tecnologia |
| :--- | :--- |
| **Runtime** | Node.js + npm |
| **Fullstack** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + Shadcn/ui |
| **Banco de Dados** | PostgreSQL (Hospedado no Coolify) |
| **ORM** | Prisma (com Adapter pg) |
| **Auth** | Better Auth |
| **Storage** | SeaweedFS (S3 Compatible) |
| **Infra** | Docker, Coolify (Self-hosted) |

## 🚀 Como Rodar Localmente (Ambiente Híbrido)

> **Nota:** Este projeto utiliza serviços hospedados (Banco de Dados e Storage) para desenvolvimento, eliminando a necessidade de Docker pesado localmente.

### Pré-requisitos

- **Node.js** instalado (v22+ recomendado, com npm).
- Acesso à VPS (SSH ou portas liberadas) para conexão com Banco de Dados.

### Passo a Passo

1. **Clone o repositório:**

	```bash
	git clone <url-do-repositorio-privado>
	cd meu-verdin
	```

2. **Instale as dependências:**

	```bash
	npm install
	```

3. **Conecte aos Serviços Remotos:**
	Abra um túnel SSH para conectar ao banco de dados remoto sem expô-lo:

	```bash
	# Exemplo: ssh -L 5432:localhost:5432 usuario@ip-da-vps -N
	```

4. **Configure as Variáveis de Ambiente:**

	- Copie `.env.example` para `.env`.
	- Atualize a `DATABASE_URL`, as chaves do Better Auth, Google OAuth e SeaweedFS.

5. **Gere o Cliente do Prisma:**
	Este passo cria o cliente em `src/generated/prisma`.

	```bash
	npm run db:generate
	```

6. **Rode as Migrations (Se necessário):**

	```bash
	# Crie/aplique migrations em desenvolvimento:
	npm run db:migrate:dev

	# Seed explicitamente as categorias do sistema:
	npm run db:seed
	```

7. **Inicie o projeto:**

	```bash
	npm run dev
	```
	O App rodará em http://localhost:3000

## 🐳 Rodar com Docker + PostgreSQL

Este projeto também pode ser executado totalmente com Docker Compose (app + banco PostgreSQL).

### Pré-requisitos

- Docker Desktop (ou Docker Engine + Compose plugin) instalado.

### Passo a passo

1. **Configure as variáveis em `.env.local`:**
	```bash
	cp .env.example .env.local
	```

	- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
	- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
	- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

	O Compose lê automaticamente `.env.local`; PostgreSQL e o endpoint interno do SeaweedFS possuem defaults de desenvolvimento. Google OAuth e as credenciais S3 permanecem opcionais para iniciar o ambiente, mas devem ser preenchidos para testar login e anexos.

2. **Suba os containers:**

	```bash
	docker compose up --build
	```

	O serviço `app` instala dependências, gera o cliente Prisma, aplica as migrations versionadas com segurança, executa o seed explícito e inicia em modo dev. Para reiniciar um ambiente de desenvolvimento com dados descartáveis, use `docker compose down -v` antes de subir novamente.

## ☁️ Deploy no Coolify

Use `docker-compose.coolify.yml`, não o Compose de desenvolvimento. No Coolify, selecione o build pack **Docker Compose**, defina a localização do Compose como `docker-compose.coolify.yml` e informe `https://meuverdin.app.br:3000` como domínio da aplicação. Configure todas as variáveis obrigatórias destacadas pelo Coolify, especialmente as credenciais Google OAuth, Better Auth e S3.

Gere as credenciais S3 de produção com `openssl rand -hex 16` para o access key e `openssl rand -hex 32` para o secret key. O stack cria o bucket definido por `S3_BUCKET` e mantém PostgreSQL e SeaweedFS em volumes privados.

3. **Acesse a aplicação:**

	- App: http://localhost:3000
	- Postgres: localhost:5432

4. **Parar os containers:**

	```bash
	docker compose down
	```

5. **Parar e remover também o volume do banco:**

	```bash
	docker compose down -v
	```

## 📂 Estrutura de Pastas

```text
.
├── src/
│   ├── app/            # Páginas e Rotas (Next.js)
│   ├── components/     # Shadcn UI e componentes custom
│   ├── lib/            # Configs (Auth, Utils)
│   └── utils/          # Cliente do Prisma e Helpers
├── prisma/             # Schema do Banco de Dados
├── src/generated/      # Cliente Prisma gerado (Output customizado)
└── public/             # Assets estáticos
```
