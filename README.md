# 💰 Meu Verdin

Sistema de gestão financeira pessoal focado em Orçado vs. Realizado com sugestões inteligentes baseadas em histórico.

## 🛠 Tech Stack

Este projeto utiliza uma arquitetura Next.js Fullstack moderna e performática com Bun.

| Camada | Tecnologia |
| :--- | :--- |
| **Runtime** | Bun (Substitui Node.js/npm) |
| **Fullstack** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + Shadcn/ui |
| **Banco de Dados** | PostgreSQL (Hospedado no Coolify) |
| **ORM** | Prisma (com Adapter pg) |
| **Auth** | Better Auth |
| **Storage** | MinIO (S3 Compatible) |
| **Infra** | Docker, Coolify (Self-hosted) |

## 🚀 Como Rodar Localmente (Ambiente Híbrido)

> **Nota:** Este projeto utiliza serviços hospedados (Banco de Dados e Storage) para desenvolvimento, eliminando a necessidade de Docker pesado localmente.

### Pré-requisitos

- **Bun** instalado (v1.0+).
- Acesso à VPS (SSH ou portas liberadas) para conexão com Banco de Dados.

### Passo a Passo

1. **Clone o repositório:**

	```bash
	git clone <url-do-repositorio-privado>
	cd meu-verdin
	```

2. **Instale as dependências:**

	```bash
	bun install
	```

3. **Conecte aos Serviços Remotos:**
	Abra um túnel SSH para conectar ao banco de dados remoto sem expô-lo:

	```bash
	# Exemplo: ssh -L 5432:localhost:5432 usuario@ip-da-vps -N
	```

4. **Configure as Variáveis de Ambiente:**

	- Copie `.env.example` para `.env`.
	- Atualize a `DATABASE_URL` e as chaves do Better Auth / MinIO.

5. **Gere o Cliente do Prisma:**
	Este passo é crucial para criar o cliente na pasta `generated/prisma` que o Bun utiliza.

	```bash
	bun run db:generate
	```

6. **Rode as Migrations (Se necessário):**

	```bash
	# If you use migrations locally run the Prisma CLI directly:
	bun prisma migrate dev

	# Or push the schema using the configured script:
	bun run db:push
	```

7. **Inicie o projeto:**

	```bash
	bun run dev
	```
	O App rodará em http://localhost:3000

## 📂 Estrutura de Pastas

```text
.
├── src/
│   ├── app/            # Páginas e Rotas (Next.js)
│   ├── components/     # Shadcn UI e componentes custom
│   ├── lib/            # Configs (Auth, Utils)
│   └── utils/          # Cliente do Prisma e Helpers
├── prisma/             # Schema do Banco de Dados
├── generated/          # Cliente Prisma gerado (Output customizado)
└── public/             # Assets estáticos
```