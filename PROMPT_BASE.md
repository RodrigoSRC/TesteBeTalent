# Prompt Base — Teste Prático Back-end BeTalent

## Contexto do Projeto

API RESTful multi-gateway de pagamentos usando **AdonisJS 6** + **MySQL** + **Docker**.
O sistema gerencia compras: ao realizar uma compra, tenta cobrar no gateway de maior prioridade. Se falhar, tenta o próximo. Deve ser fácil adicionar novos gateways (modular).

**Nível escolhido: 2 (Júnior experiente / Pleno)**

- Valor da compra calculado via back-end (produto × quantidade)
- Gateways com autenticação
- TDD e Docker Compose (requisitos obrigatórios)

**Repositório**: O projeto está na raiz de `c:\Users\Usuário\Projetos\TesteBeTalent` (sem subpasta).

---

## Estrutura do Banco de Dados

- **users**: id, email, password
- **gateways**: id, name, is_active, priority
- **clients**: id, name, email
- **products**: id, name, amount (em centavos)
- **transactions**: id, client_id, gateway_id, product_id, quantity, external_id, status, amount, card_last_numbers

---

## Rotas

### Públicas

- `POST /login` — Login do sistema
- `POST /purchases` — Realizar compra (1 produto + quantidade, dados do cartão, dados do cliente)

### Privadas (autenticadas)

- `PATCH /gateways/:id/toggle` — Ativar/desativar gateway
- `PATCH /gateways/:id/priority` — Alterar prioridade
- `CRUD /users` — Gerenciamento de usuários
- `CRUD /products` — Gerenciamento de produtos
- `GET /clients` — Listar clientes
- `GET /clients/:id` — Detalhe do cliente + compras
- `GET /transactions` — Listar compras
- `GET /transactions/:id` — Detalhe da compra
- `POST /transactions/:id/refund` — Reembolso de uma compra

---

## Gateways Mock (já prontos via Docker)

### Gateway 1 (http://localhost:3001)

- **Auth**: POST `/login` com `{"email":"dev@betalent.tech","token":"FEC9BB078BF338F464F96B48089EB498"}` → retorna Bearer token
- **Criar transação**: POST `/transactions` com `{amount, name, email, cardNumber, cvv}`
- **Reembolso**: POST `/transactions/:id/charge_back`
- CVV 100 ou 200 = erro

### Gateway 2 (http://localhost:3002)

- **Auth**: Headers `Gateway-Auth-Token: tk_f2198cc671b5289fa856` + `Gateway-Auth-Secret: 3d15e8ed6131446ea7e3456728b1211f`
- **Criar transação**: POST `/transacoes` com `{valor, nome, email, numeroCartao, cvv}`
- **Reembolso**: POST `/transacoes/reembolso` com `{id}`
- CVV 200 ou 300 = erro

---

## Stack Técnica

- **Framework**: AdonisJS 6
- **ORM**: Lucid
- **Validação**: VineJS
- **Testes**: Japa (TDD)
- **Banco**: MySQL
- **Containerização**: Docker Compose (app + MySQL + gateways mock)

---

## Passos de Implementação

Cole no chat: **"Estou no PASSO X"** e o número abaixo.

### PASSO 1 — Inicializar projeto AdonisJS 6

- Iniciar projeto AdonisJS 6 na raiz do repo (sem subpasta)
- Configurar estrutura API (sem views)
- Instalar dependências: lucid (MySQL), auth, vinejs
- Configurar .env e .env.example

### PASSO 2 — Docker Compose

- Criar docker-compose.yml com: MySQL, app AdonisJS, gateways mock
- Criar Dockerfile para a aplicação
- Configurar .env para apontar ao MySQL do container

### PASSO 3 — Migrations e Models

- Criar todas as migrations (users, gateways, clients, products, transactions, transaction_products)
- Criar todos os models com relacionamentos Lucid
- Criar seeders para dados iniciais (admin user, gateways)

### PASSO 4 — Autenticação

- Configurar @adonisjs/auth com tokens de API
- Implementar login (gerar token)
- Criar middleware de autenticação para proteger rotas privadas
- Testes: login, acesso autenticado/não autenticado

### PASSO 5 — CRUD de Usuários

- Controller + rotas CRUD
- Validação com VineJS
- Proteção por autenticação
- Testes

### PASSO 6 — CRUD de Produtos

- Controller + rotas CRUD
- Validação com VineJS
- Proteção por autenticação
- Testes

### PASSO 7 — Clientes e Listagens

- Controller de clientes (listar todos, detalhe + compras)
- Testes

### PASSO 8 — Serviço Multi-Gateway (núcleo)

- Criar interface/contrato base GatewayProvider
- Implementar Gateway1Provider (auth Bearer, endpoints em inglês)
- Implementar Gateway2Provider (auth headers, endpoints em português)
- Criar GatewayService que tenta por ordem de prioridade com fallback
- Testes unitários dos providers e do serviço

### PASSO 9 — Fluxo de Compra

- Rota pública POST /purchases
- Validar dados (product_id, quantity, cartão, cliente)
- Calcular valor total (produto.amount × quantity)
- Criar/buscar cliente
- Chamar GatewayService para processar pagamento
- Salvar transação no banco (com product_id e quantity)
- Testes de integração

### PASSO 10 — Listagem e Detalhes de Transações

- Rotas GET /transactions e GET /transactions/:id
- Incluir dados do cliente, gateway, produtos
- Testes

### PASSO 11 — Reembolso

- Rota POST /transactions/:id/refund
- Proteção por autenticação
- Chamar gateway correto para chargeback
- Atualizar status da transação
- Testes

### PASSO 12 — Revisão, Testes Finais e README

- Rodar todos os testes
- Revisar validações e edge cases
- Escrever README completo (requisitos, instalação, rotas, arquitetura)

---

## Como usar este prompt

1. Abra um novo chat
2. Cole todo este conteúdo
3. Diga: **"Estou no PASSO X, vamos implementar"**
4. Ao terminar o passo, abra novo chat e repita com o próximo passo
