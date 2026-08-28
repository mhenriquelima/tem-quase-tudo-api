!!! Documento gerado via IA !!!

# Tem Quase Tudo API

API REST para gerenciamento de usuarios, produtos e categorias.

## Requisitos

- Node.js
- PostgreSQL
- Postman (opcional, para testar os endpoints)

## Configuracao

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
JWT_SECRET=uma-chave-secreta
PORT=3000
CORS_ORIGIN=*
```

Instale as dependencias e crie as tabelas:

```bash
npm install
npm run migrate
npm start
```

A API ficara disponivel em `http://localhost:3000`.

## Resumo dos endpoints

| Metodo | Endpoint | Autenticacao |
| --- | --- | --- |
| GET | `/api` | Publico |
| POST | `/api/users/registro` | Publico |
| POST | `/api/users/login` | Publico |
| GET | `/api/users/me` | Bearer token |
| GET | `/api/produtos` | Publico |
| GET | `/api/produtos/:id` | Publico |
| POST | `/api/produtos` | Publico |
| PUT | `/api/produtos/:id` | Publico |
| DELETE | `/api/produtos/:id` | Publico |
| GET | `/api/categorias` | Publico |
| GET | `/api/categorias/:id` | Publico |
| POST | `/api/categorias` | Admin |
| PUT | `/api/categorias/:id` | Admin |
| DELETE | `/api/categorias/:id` | Admin |
| GET | `/api/carrinho` | Bearer token |
| POST | `/api/carrinho/itens` | Bearer token |
| PUT | `/api/carrinho/itens/:produtoId` | Bearer token |
| DELETE | `/api/carrinho/itens/:produtoId` | Bearer token |
| POST | `/api/pedido/checkout` | Bearer token |
| GET | `/api/pedido` | Bearer token |
| GET | `/api/pedido/:id` | Bearer token |
| PUT | `/api/pedido/:id/status` | Admin |
| PUT | `/api/pedido/:id/cancelar` | Bearer token |

## Autenticacao

### Registrar usuario

**POST** `/api/users/registro`

Body JSON:

```json
{
  "nome": "Maria Silva",
  "email": "maria@teste.com",
  "senha": "123456"
}
```

O usuario novo e criado com o papel `cliente`.

### Fazer login

**POST** `/api/users/login`

Body JSON:

```json
{
  "email": "maria@teste.com",
  "senha": "123456"
}
```

A resposta contem um `token`. No Postman, use a aba **Authorization**, selecione **Bearer Token** e cole esse valor no campo **Token**.

### Consultar usuario autenticado

**GET** `/api/users/me`

Envie o header:

```http
Authorization: Bearer SEU_TOKEN
```

## Categorias

Apenas leitura e consulta sao publicas. Criacao, alteracao e exclusao exigem um token de usuario com papel `admin`.

### Listar categorias

**GET** `/api/categorias`

### Buscar categoria por ID

**GET** `/api/categorias/1`

### Criar categoria

**POST** `/api/categorias`

Headers:

```http
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_ADMIN
```

Body JSON:

```json
{
  "nome": "Eletronicos"
}
```

### Atualizar categoria

**PUT** `/api/categorias/1`

Body JSON:

```json
{
  "nome": "Informatica"
}
```

Envie tambem o header `Authorization` com o token de admin.

### Excluir categoria

**DELETE** `/api/categorias/1`

Envie o header `Authorization` com o token de admin. A resposta esperada e `204 No Content`.

## Criar um administrador

O cadastro publico sempre cria usuarios como `cliente`. Para promover um usuario, execute no PostgreSQL:

```sql
UPDATE usuarios
SET papel = 'admin'
WHERE email = 'admin@teste.com';
```

Depois, faca login novamente para obter um token atualizado:

```http
POST http://localhost:3000/api/users/login
```

Use o novo token nas operacoes de categorias. O login deve retornar `"papel": "admin"` dentro de `user`.

## Produtos

### Listar produtos

**GET** `/api/produtos`

### Buscar produto por ID

**GET** `/api/produtos/1`

### Criar produto

**POST** `/api/produtos`

Body JSON:

```json
{
  "nome": "Notebook",
  "descricao": "Notebook para trabalho",
  "preco": 2499.90,
  "estoque": 10
}
```

`nome`, `preco` e `estoque` devem ser informados. `preco` deve ser maior ou igual a zero e `estoque` deve ser um inteiro maior ou igual a zero.

### Atualizar produto

**PUT** `/api/produtos/1`

Body JSON:

```json
{
  "nome": "Notebook atualizado",
  "descricao": "Modelo revisado",
  "preco": 2299.90,
  "estoque": 8
}
```

### Excluir produto

**DELETE** `/api/produtos/1`

A resposta esperada e `204 No Content`.

## Carrinho

Todas as operacoes do carrinho exigem um usuario autenticado. Configure no Postman a aba **Authorization** como **Bearer Token** e informe o token obtido no login.

### Consultar carrinho

**GET** `/api/carrinho`

Exemplo de resposta:

```json
{
  "carrinho_id": 1,
  "itens": [],
  "total": 0
}
```

### Adicionar produto

**POST** `/api/carrinho/itens`

Body JSON:

```json
{
  "produto_id": 1,
  "quantidade": 2
}
```

`quantidade` e opcional e assume `1` quando omitida. Se o produto ja estiver no carrinho, a quantidade e somada.

### Atualizar quantidade

**PUT** `/api/carrinho/itens/1`

Body JSON:

```json
{
  "quantidade": 3
}
```

Neste exemplo, `1` e o `produtoId`, nao o ID do item do carrinho.

### Remover produto

**DELETE** `/api/carrinho/itens/1`

Neste exemplo, `1` e o `produtoId`. A resposta esperada e `204 No Content`.

## Pedidos

Todas as rotas de pedidos exigem um token de usuario autenticado. Para criar um pedido, adicione primeiro pelo menos um produto ao carrinho.

### Finalizar compra

**POST** `/api/pedido/checkout`

Nao exige body. O sistema cria o pedido, calcula o total, reduz o estoque e esvazia o carrinho.

Resposta esperada: `201 Created`.

### Listar meus pedidos

**GET** `/api/pedido`

Retorna somente os pedidos do usuario autenticado.

### Ver detalhes de um pedido

**GET** `/api/pedido/1`

O usuario pode consultar seus proprios pedidos. Administradores podem consultar qualquer pedido.

### Atualizar status

**PUT** `/api/pedido/1/status`

Exige token de administrador.

Body JSON:

```json
{
  "status": "pago"
}
```

Status validos: `pendente`, `pago`, `enviado` e `cancelado`.

### Cancelar pedido

**PUT** `/api/pedido/1/cancelar`

O dono do pedido ou um administrador pode cancelar. Pedidos com status `enviado` ou `cancelado` nao podem ser cancelados. Ao cancelar, o estoque dos produtos e devolvido.

## Respostas e erros comuns

- `200 OK`: consulta ou alteracao realizada.
- `201 Created`: registro criado.
- `204 No Content`: registro excluido.
- `400 Bad Request`: dados invalidos.
- `401 Unauthorized`: token ausente ou invalido.
- `403 Forbidden`: token valido, mas usuario nao e admin.
- `404 Not Found`: registro ou rota nao encontrada.
- `409 Conflict`: categoria com o mesmo nome ja existe.

As mensagens de erro sao retornadas em JSON, por exemplo:

```json
{
  "erro": "Acesso restrito"
}
```
