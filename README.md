# Sistema de Projetos e Tarefas

Esse projeto é uma aplicação web completa para organizar projetos e tarefas.

O usuário pode criar uma conta, fazer login, cadastrar projetos e adicionar tarefas dentro deles. Cada usuário só consegue acessar os próprios dados. O sistema possui uma interface responsiva que funciona em computador, tablet e celular.

## Tecnologias usadas

- JavaScript e Node.js;
- Express para criar as rotas REST;
- MongoDB como banco de dados;
- Mongoose para trabalhar com o MongoDB;
- JWT para autenticação;
- bcryptjs para proteger as senhas;
- Zod para validar os dados;
- GraphQL e Apollo Server;
- HTML, CSS e JavaScript no frontend;
- Postman para testar as requisições.

## Como executar

É necessário ter o Node.js 20 ou uma versão mais nova instalada.

Primeiro, abra o terminal na pasta do projeto e instale as dependências:

```bash
npm install
```

Depois, crie o arquivo `.env`:

```bash
npm run setup
```

Abra o `.env` e configure o endereço do MongoDB. Usando o MongoDB Atlas, ele fica parecido com este exemplo:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/projetos
JWT_SECRET=CHAVE_GERADA_PELO_SETUP
```

Os dados acima são apenas um exemplo. O arquivo `.env` não deve ser enviado porque contém a senha do banco.

Para iniciar o projeto:

```bash
npm run dev
```

Quando estiver funcionando, o terminal mostrará estes endereços:

```text
Aplicação disponível em http://localhost:3000
GraphQL disponível em http://localhost:3000/graphql
```

Abra `http://localhost:3000` no navegador para usar o sistema. Pela interface é possível:

- criar uma conta e fazer login;
- criar, editar e excluir projetos;
- adicionar tarefas aos projetos;
- alterar o status e excluir tarefas;
- acompanhar a quantidade de projetos e tarefas.

O frontend usa as rotas REST para autenticação e alterações. A consulta do painel, com os projetos e suas tarefas, é feita pelo GraphQL.

Para conferir a conexão com o banco, acesse `http://localhost:3000/health`. O resultado esperado é:

```json
{
  "status": "ok"
}
```

## Dados do sistema

O projeto possui três entidades:

- `User`: guarda nome, e-mail e senha do usuário;
- `Project`: guarda nome, descrição e o usuário dono do projeto;
- `Task`: guarda título, descrição, status e o projeto da tarefa.

Um usuário pode ter vários projetos e um projeto pode ter várias tarefas. Esses relacionamentos são feitos com referências `ObjectId` do Mongoose.

Os status disponíveis para uma tarefa são:

- `PENDING`: pendente;
- `IN_PROGRESS`: em andamento;
- `COMPLETED`: concluída.

## Autenticação

O cadastro e o login devolvem um token JWT. Esse token deve ser enviado nas operações protegidas:

```text
Authorization: Bearer TOKEN
```

A senha é protegida com bcryptjs antes de ser salva. O token dura duas horas e cada usuário só pode acessar os próprios dados.

## Rotas REST

Todas as rotas REST começam com `/api`.

| Método | Rota | O que faz |
| --- | --- | --- |
| POST | `/api/auth/register` | Cadastra um usuário |
| POST | `/api/auth/login` | Faz o login |
| GET | `/api/auth/profile` | Mostra o usuário conectado |
| POST | `/api/projects` | Cria um projeto |
| GET | `/api/projects` | Lista os projetos do usuário |
| GET | `/api/projects/:id` | Busca um projeto pelo ID |
| PATCH | `/api/projects/:id` | Atualiza um projeto |
| DELETE | `/api/projects/:id` | Exclui um projeto e suas tarefas |
| POST | `/api/projects/:projectId/tasks` | Cria uma tarefa no projeto |
| GET | `/api/projects/:projectId/tasks` | Lista as tarefas do projeto |
| GET | `/api/tasks/:id` | Busca uma tarefa pelo ID |
| PATCH | `/api/tasks/:id` | Atualiza uma tarefa |
| DELETE | `/api/tasks/:id` | Exclui uma tarefa |

## GraphQL

O GraphQL funciona no endereço `http://localhost:3000/graphql` e usa o mesmo token JWT das rotas REST.

Na aplicação, o GraphQL é usado para carregar o usuário conectado, os projetos e as tarefas do painel em uma única consulta.

As consultas disponíveis são:

- `me`: mostra o usuário conectado;
- `projects`: lista os projetos;
- `project`: busca um projeto pelo ID;
- `tasks`: lista as tarefas de um projeto;
- `task`: busca uma tarefa pelo ID.

As alterações disponíveis são:

- `register`: cadastra um usuário;
- `login`: faz o login;
- `createProject`: cria um projeto;
- `updateProject`: atualiza um projeto;
- `deleteProject`: exclui um projeto;
- `createTask`: cria uma tarefa;
- `updateTask`: atualiza uma tarefa;
- `deleteTask`: exclui uma tarefa.

## Postman

O arquivo `postman/Backend-Projetos.postman_collection.json` pode ser importado no Postman.

A coleção possui cinco requisições:

1. Cadastrar usuário;
2. fazer login;
3. criar projeto;
4. criar tarefa;
5. consultar os projetos e as tarefas pelo GraphQL.

Para testar, deixe o backend funcionando com `npm run dev`, importe a coleção e execute as requisições nessa ordem. O token e o ID do projeto são salvos automaticamente pela coleção.

O arquivo `docs/requisicoes.http` possui os mesmos exemplos para quem preferir testar pelo REST Client do VS Code.

## Organização das pastas

```text
public/
  index.html      estrutura da interface
  styles.css      aparência e responsividade
  app.js          integração do frontend com a API

src/
  controllers/  funções de cadastro, consulta, atualização e exclusão
  graphql/       schema e resolvers do GraphQL
  models/        modelos do MongoDB
  app.js         configuração do Express e do GraphQL
  auth.js        validação do token JWT
  errors.js      tratamento dos erros
  routes.js      rotas REST
  validation.js  validação dos dados
```

O `index.js` conecta o projeto ao MongoDB e inicia o servidor.
