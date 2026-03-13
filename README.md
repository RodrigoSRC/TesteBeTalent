# BeTalent — Multi-Gateway Payment API

API RESTful construída com **AdonisJS 6** para processamento de pagamentos multi-gateway. Ao realizar uma compra, o sistema tenta cobrar no gateway ativo de maior prioridade e, em caso de falha, realiza fallback automático para o próximo gateway disponível.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação e Execução](#instalação-e-execução)
  - [Com Docker (recomendado)](#com-docker-recomendado)
  - [Sem Docker (local)](#sem-docker-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rotas da API](#rotas-da-api)
  - [Autenticação](#autenticação)
  - [Usuários](#usuários)
  - [Produtos](#produtos)
  - [Clientes](#clientes)
  - [Compras](#compras)
  - [Transações](#transações)
  - [Gateways](#gateways)
- [Banco de Dados](#banco-de-dados)
- [Arquitetura Multi-Gateway](#arquitetura-multi-gateway)
- [Testes](#testes)

---

## Tecnologias

| Camada          | Tecnologia                                   |
| --------------- | -------------------------------------------- |
| Framework       | AdonisJS 6                                   |
| ORM             | Lucid (AdonisJS)                             |
| Validação       | VineJS                                       |
| Autenticação    | `@adonisjs/auth` (Bearer token / API tokens) |
| Banco de dados  | MySQL 8.0                                    |
| Testes          | Japa (TDD funcional)                         |
| Containerização | Docker + Docker Compose                      |
| Linguagem       | TypeScript 5                                 |

---

## Arquitetura

```
app/
├── controllers/       # HTTP handlers (CRUD + negócio)
├── middleware/        # Auth, force-json, container-bindings
├── models/            # Models Lucid (User, Client, Product, Gateway, Transaction)
├── services/
│   └── gateway/
│       ├── contracts/         # Interface GatewayProvider
│       ├── providers/         # Gateway1Provider, Gateway2Provider
│       └── gateway_service.ts # Orquestrador multi-gateway com fallback
└── validators/        # Schemas VineJS de validação de entrada
```

O `GatewayService` é o núcleo do sistema: ele consulta os gateways ativos ordenados por prioridade e itera até que um seja bem-sucedido ou todos falhem. Adicionar um novo gateway requer apenas implementar a interface `GatewayProvider` e registrar o provider no mapa do serviço.

---

## Requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) **OU**
- Node.js 20+ e MySQL 8.0+ (para execução local)

---

## Instalação e Execução

### Com Docker (recomendado)

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd <pasta-do-projeto>
   ```

2. **Configure o `.env`:**

   ```bash
   cp .env.example .env
   # Gere uma APP_KEY:
   node ace generate:key
   # Cole o valor gerado em APP_KEY no .env
   ```

3. **Suba os containers:**

   ```bash
   docker compose up -d
   ```

   Isso inicia:
   - `betalent-mysql` — MySQL 8.0 na porta `3306`
   - `betalent-app` — API AdonisJS na porta `3333`
   - `betalent-gateways` — Servidores mock dos gateways nas portas `3001` e `3002`

4. **Execute as migrations e seeders:**

   ```bash
   docker exec betalent-app node ace migration:run
   docker exec betalent-app node ace db:seed
   ```

5. **Acesse a API:**
   ```
   http://localhost:3333
   ```

> **Credenciais padrão do admin** (criadas pelo seeder):
>
> - Email: `admin@betalent.tech`
> - Senha: `secret123`

---

### Sem Docker (local)

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configure o `.env`:**

   ```bash
   cp .env.example .env
   ```

   Edite o `.env` com as credenciais do seu MySQL local e gere a `APP_KEY`:

   ```bash
   node ace generate:key
   ```

3. **Execute as migrations e seeders:**

   ```bash
   node ace migration:run
   node ace db:seed
   ```

4. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```

---

## Variáveis de Ambiente

| Variável       | Descrição                                                     | Exemplo                |
| -------------- | ------------------------------------------------------------- | ---------------------- |
| `APP_KEY`      | Chave de criptografia da aplicação (obrigatória)              | `base64:...`           |
| `PORT`         | Porta HTTP da aplicação                                       | `3333`                 |
| `HOST`         | Host da aplicação                                             | `localhost`            |
| `NODE_ENV`     | Ambiente (`development`/`production`/`test`)                  | `development`          |
| `DB_HOST`      | Host do MySQL                                                 | `127.0.0.1`            |
| `DB_PORT`      | Porta do MySQL                                                | `3306`                 |
| `DB_USER`      | Usuário do MySQL                                              | `root`                 |
| `DB_PASSWORD`  | Senha do MySQL                                                | `root`                 |
| `DB_DATABASE`  | Nome do banco                                                 | `betalent`             |
| `LOG_LEVEL`    | Nível de log                                                  | `info`                 |
| `GATEWAY1_URL` | URL do Gateway 1 (opcional, default: `http://localhost:3001`) | `http://gateways:3001` |
| `GATEWAY2_URL` | URL do Gateway 2 (opcional, default: `http://localhost:3002`) | `http://gateways:3002` |

---

## Rotas da API

A base URL é `http://localhost:3333`. Rotas marcadas com 🔒 exigem o header:

```
Authorization: Bearer <token>
```

---

### Autenticação

#### `POST /login`

Autentica um usuário e retorna um Bearer token.

**Body:**

```json
{
  "email": "admin@betalent.tech",
  "password": "secret123"
}
```

**Resposta `200`:**

```json
{
  "token": {
    "type": "bearer",
    "value": "oat_..."
  }
}
```

---

#### `POST /logout` 🔒

Revoga o token atual.

**Resposta `200`:** `{ "message": "Logged out" }`

---

### Usuários

> Todas as rotas de usuários exigem autenticação 🔒.

| Método   | Rota         | Descrição               |
| -------- | ------------ | ----------------------- |
| `GET`    | `/users`     | Lista todos os usuários |
| `GET`    | `/users/:id` | Detalhe de um usuário   |
| `POST`   | `/users`     | Cria um usuário         |
| `PUT`    | `/users/:id` | Atualiza um usuário     |
| `DELETE` | `/users/:id` | Remove um usuário       |

**Body `POST /users`:**

```json
{
  "email": "novo@exemplo.com",
  "password": "Senha1234"
}
```

**Body `PUT /users/:id`** (todos os campos opcionais):

```json
{
  "email": "atualizado@exemplo.com",
  "password": "NovaSenha123"
}
```

---

### Produtos

> Todas as rotas de produtos exigem autenticação 🔒.

| Método   | Rota            | Descrição               |
| -------- | --------------- | ----------------------- |
| `GET`    | `/products`     | Lista todos os produtos |
| `GET`    | `/products/:id` | Detalhe de um produto   |
| `POST`   | `/products`     | Cria um produto         |
| `PUT`    | `/products/:id` | Atualiza um produto     |
| `DELETE` | `/products/:id` | Remove um produto       |

**Body `POST /products`:**

```json
{
  "name": "Camiseta BeTalent",
  "amount": 4990
}
```

> `amount` é em **centavos** (ex: `4990` = R$49,90).

---

### Clientes

> Exigem autenticação 🔒.

| Método | Rota           | Descrição                                 |
| ------ | -------------- | ----------------------------------------- |
| `GET`  | `/clients`     | Lista todos os clientes                   |
| `GET`  | `/clients/:id` | Detalhe do cliente + histórico de compras |

**Resposta `GET /clients/:id`:**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "transactions": [
    {
      "id": 1,
      "amount": 9980,
      "status": "paid",
      "quantity": 2,
      "product": { "id": 1, "name": "Camiseta BeTalent", "amount": 4990 },
      "gateway": { "id": 1, "name": "Gateway 1" }
    }
  ]
}
```

---

### Compras

#### `POST /purchases` _(pública — sem autenticação)_

Realiza uma compra. O sistema calcula o valor total (`produto.amount × quantity`), cria ou reutiliza o cliente pelo e-mail e tenta processar o pagamento pelos gateways ativos em ordem de prioridade.

**Body:**

```json
{
  "productId": 1,
  "quantity": 2,
  "client": {
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "card": {
    "number": "4111111111111111",
    "cvv": "123"
  }
}
```

**Resposta `201`:**

```json
{
  "transactionId": 1,
  "status": "paid",
  "amount": 9980,
  "gateway": "Gateway 1",
  "cardLastNumbers": "1111"
}
```

**Erros:**

- `404` — Produto não encontrado
- `422` — Dados inválidos (número do cartão com tamanho errado, email inválido, campos faltando...)
- `422` — Todos os gateways falharam

---

### Transações

> Exigem autenticação 🔒.

| Método | Rota                       | Descrição                           |
| ------ | -------------------------- | ----------------------------------- |
| `GET`  | `/transactions`            | Lista todas as transações           |
| `GET`  | `/transactions/:id`        | Detalhe de uma transação            |
| `POST` | `/transactions/:id/refund` | Solicita reembolso de uma transação |

**Resposta `GET /transactions/:id`:**

```json
{
  "id": 1,
  "amount": 9980,
  "status": "paid",
  "quantity": 2,
  "externalId": "ext_abc123",
  "cardLastNumbers": "1111",
  "client": { "id": 1, "name": "João Silva", "email": "joao@exemplo.com" },
  "gateway": { "id": 1, "name": "Gateway 1" },
  "product": { "id": 1, "name": "Camiseta BeTalent", "amount": 4990 }
}
```

**`POST /transactions/:id/refund`:**

- Transação deve estar com `status = "paid"`
- Chama o endpoint de chargeback/reembolso do gateway correto
- Atualiza o status para `"refunded"`
- Resposta `200`: `{ "message": "Transaction refunded successfully" }`

---

### Gateways

> Exigem autenticação 🔒.

| Método  | Rota                     | Descrição                         |
| ------- | ------------------------ | --------------------------------- |
| `PATCH` | `/gateways/:id/toggle`   | Ativa ou desativa um gateway      |
| `PATCH` | `/gateways/:id/priority` | Altera a prioridade de um gateway |

**`PATCH /gateways/:id/toggle`:**

Alterna o estado `is_active` do gateway. Não requer body.

**Resposta `200`:**

```json
{
  "id": 1,
  "name": "Gateway 1",
  "isActive": false,
  "priority": 1
}
```

**`PATCH /gateways/:id/priority`:**

**Body:**

```json
{
  "priority": 2
}
```

**Resposta `200`:**

```json
{
  "id": 1,
  "name": "Gateway 1",
  "isActive": true,
  "priority": 2
}
```

---

## Banco de Dados

```
users
  id, email (unique), password, role (admin|manager|finance|user), created_at, updated_at

auth_access_tokens
  id, tokenable_id → users.id, type, name, hash, abilities, last_used_at, expires_at

gateways
  id, name, is_active (bool), priority (int, menor = maior prioridade), created_at, updated_at

clients
  id, name, email (unique), created_at, updated_at

products
  id, name, amount (int, em centavos), created_at, updated_at

transactions
  id,
  client_id  → clients.id,
  gateway_id → gateways.id,
  product_id → products.id,
  quantity,
  external_id (nullable),
  status (pending|paid|refunded|failed),
  amount (int, em centavos),
  card_last_numbers (4 chars, nullable),
  created_at, updated_at
```

---

## Arquitetura Multi-Gateway

O sistema suporta múltiplos gateways de pagamento com fallback automático. O contrato base é definido pela interface `GatewayProvider`:

```typescript
interface GatewayProvider {
  charge(input: GatewayChargeInput): Promise<GatewayChargeResult>
  refund(externalId: string): Promise<void>
}
```

**Fluxo de uma compra:**

```
POST /purchases
    │
    ▼
GatewayService.charge()
    │
    ├── Consulta gateways ativos, ORDER BY priority ASC
    │
    ├── Gateway 1 (priority=1) → provider.charge() ──► sucesso → salva transação ✓
    │                                                └► falha  → tenta próximo
    │
    ├── Gateway 2 (priority=2) → provider.charge() ──► sucesso → salva transação ✓
    │                                                └► falha  → tenta próximo
    │
    └── Todos falharam → lança erro 422
```

**Para adicionar um novo gateway:**

1. Crie uma classe implementando `GatewayProvider` em `app/services/gateway/providers/`
2. Insira uma linha na tabela `gateways` com o nome e prioridade desejados
3. Registre o provider no `Map` dentro do `GatewayService`

---

## Testes

O projeto usa **Japa** com TDD funcional. Os testes rodam contra um banco SQLite em memória (sem necessidade de MySQL rodando).

```bash
# Rodar todos os testes
node ace test

# Rodar apenas uma suite
node ace test --files="tests/functional/purchase.spec.ts"
```

**Cobertura atual:** 60 testes, todos passando ✓

| Suite                         | Testes |
| ----------------------------- | ------ |
| Auth — Login                  | 5      |
| Auth — Rotas protegidas       | 3      |
| Listagem de Clientes          | 6      |
| GatewayService — charge       | 6      |
| GatewayService — refund       | 3      |
| CRUD de Produtos              | 9      |
| POST /purchases               | 10     |
| POST /transactions/:id/refund | 5      |
| GET /transactions             | 3      |
| GET /transactions/:id         | 3      |
| CRUD de Usuários              | 7      |
| PATCH /gateways/:id/toggle    | 4      |
| PATCH /gateways/:id/priority  | 5      |
| **Total**                     | **69** |

---

## Collections para Teste Manual

O projeto inclui duas collections no formato **Insomnia** para facilitar o teste manual das APIs:

| Arquivo | Descrição |
| ------- | --------- |
| [`insomnia_collection.json`](insomnia_collection.json) | Rotas da API BeTalent (porta 3333) |
| [`insomnia_gateways_mock.json`](insomnia_gateways_mock.json) | Rotas dos gateways mock (portas 3001 e 3002) |

### Como importar no Insomnia

1. Abra o Insomnia
2. Clique em **Import** → **File**
3. Selecione o arquivo `.json` desejado

### Fluxo básico de teste

1. **Login** (`POST /login`) → copie o `token` da resposta
2. Vá em **Environments** no Insomnia e cole o valor na variável `token`
3. Todas as rotas protegidas usarão o token automaticamente via `Bearer {{ _.token }}`

> As credenciais padrão do admin são `admin@betalent.tech` / `secret123` (criadas pelo seeder).
