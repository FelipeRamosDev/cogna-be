# Cogna - Teste Tecnico - Backend
O projeto foi desenvolvido utilizando Node.js e Express, com foco em modularidade e escalabilidade. As rotas e controllers são carregados automaticamente, permitindo fácil manutenção e expansão. A arquitetura separa claramente as responsabilidades, e a inicialização do servidor é centralizada na classe `APIServer`, que gerencia todo o ciclo de vida da aplicação.

## Índice
- [Instalação com Docker Compose](#instalação-com-docker-compose)
- [Principais decisões técnicas](#principais-decisões-técnicas)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Extras - Diferenciais (Opcionais)](#extras---diferenciais-opcionais)
- [Descrição técnica.](#descrição-técnica)

## Instalação com Docker Compose
1. Certifique-se de ter o Docker instalado em sua máquina.
2. Clone o repositório:
   ```bash
   git clone https://github.com/FelipeRamosDev/cogna-be.git
   cd cogna-be
   ```
3. Rode o seguinte comando para iniciar o container do Postgres:
   ```bash
   docker-compose up --build -d
   ```

   <details>
   <summary><strong>Instalação sem Docker</strong></summary>

   Para rodar o projeto sem Docker, siga os passos abaixo:
   1. Clone o repositório:
      ```bash
      git clone https://github.com/FelipeRamosDev/cogna-be.git
      cd cogna-be
      ```
   2. Instale as dependências:
      ```bash
      npm install
      ```
   3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente, se a variável `SERVER_PORT` não estiver definida, a porta padrão será 8000:
      ```env
      SERVER_PORT=<PORT>
      ```
   4. Inicie o servidor:
      ```bash
      npm start
      ```
   </details>

## Principais decisões técnicas
- Utilização de carregamento automático (auto-loading) para rotas e controllers, facilitando a escalabilidade e manutenção do projeto.
- Estrutura modular, permitindo a adição de novas rotas e controllers sem necessidade de alterações manuais no arquivo principal.
- Separação clara de responsabilidades entre definição de rotas, lógica de controle e inicialização do servidor.
- Implementação de um serviço centralizado (`APIServer`) para gerenciar o ciclo de vida da aplicação, incluindo a configuração do servidor e o carregamento de rotas e controllers.

## Extras - Diferenciais (Opcionais)

#### **Implementação do Docker:**
   O projeto agora pode ser executado em containers Docker, usando arquivos `Dockerfile` e `docker-compose.yml` para orquestrar frontend, backend e banco de dados. Basta rodar `docker-compose up --build` para iniciar tudo integrado.

#### **Implementação do PostgreSQL:** 
   O backend utiliza PostgreSQL como banco de dados, configurado automaticamente pelo Docker Compose. Todos os produtos são salvos e consultados diretamente do banco, com persistência garantida entre reinicializações.

#### **Implementação do GitHub Actions CI:** 
   Foi adicionado um workflow de CI com GitHub Actions, que executa build e testes automatizados a cada pull request ou push, usando um ambiente com PostgreSQL para garantir a qualidade do código.

#### **Carregamento dos produtos de "/" vindo do banco de dados:** 
   A página inicial (`/`) carrega e exibe os produtos diretamente do banco PostgreSQL, garantindo que a listagem esteja sempre atualizada.

#### **Criação dos testes Jest:** 
   Foram criados testes automatizados com Jest para controllers, models e endpoints. Os testes podem ser executados localmente com `npm run test` e também rodam automaticamente no CI.


### Endpoints Disponíveis
- `GET /`: Retorna a lista de produtos.
- `GET /produto/:id`: Retorna os detalhes de um produto específico.
- `POST /produto/importar`: Importa produtos a partir de um arquivo JSON.
- `PUT /produto/criar`: Cria um novo produto (ainda não implementado).

## Funcionalidades Implementadas
- Listagem de produtos na rota `/` com dados carregados do banco de dados PostgreSQL.
- Detalhamento de produtos na rota `/produto/:id`, retornando informações específicas de cada produto.
- Importação de produtos via arquivo JSON na rota `/produto/importar`, permitindo a adição em massa de produtos ao banco de dados.
- Estrutura de testes automatizados com Jest para garantir a qualidade do código e a funcionalidade dos endpoints.

### Carregamento Automático de Rotas e Controllers
- As rotas e controllers são carregados dinamicamente a partir de diretórios específicos.
- O sistema percorre os diretórios de rotas e controllers, importando automaticamente todos os arquivos encontrados.
- Isso elimina a necessidade de registrar manualmente cada rota ou controller, reduzindo erros e facilitando a expansão do sistema.
- Os arquivos de controllers e rotas devem seguir as extensões `*.controller.js` e `*.route.js`, respectivamente, para serem automaticamente identificados e carregados pelo sistema.

## Descrição técnica.

### Serviço Principal: Classe `APIServer`
- A classe `APIServer` é responsável por inicializar e configurar o servidor da API.
- Gerencia o ciclo de vida do servidor, incluindo o carregamento das rotas, controllers e middlewares necessários.
- Centraliza a configuração do servidor, tornando o ponto de entrada único e facilitando testes e manutenção.
- Garante que todas as dependências estejam corretamente carregadas antes de iniciar o serviço de escuta de requisições.

### Serviços Implementados
### APIServer
Classe responsável por iniciar o servidor Express, carregar rotas e controllers, e gerenciar o ciclo de vida da aplicação.
##### Route
Classe que define a estrutura de uma rota, incluindo o método HTTP, o caminho e o controller associado.
#### PostgesDB
Classe responsável por gerenciar a conexão com o banco de dados PostgreSQL, garantindo que as operações de CRUD sejam realizadas corretamente. Também gerencia a criação de tabelas e schemas configurados através dos models ``Table`` e ``Schema``.

### Models
- ``Schema``: Define a estrutura dos dados e validações para os produtos.
- ``Table``: Representa a tabela de produtos no banco de dados, incluindo métodos para operações CRUD.
- ``Field``: Define os campos da tabela, incluindo tipos e validações.


### Estrutura do Projeto
```   plaintext
cogna-be/
├── src/
│   ├── controllers/
│   │   ├── produto/
│   │   │   ├── id.controller.js
│   │   ├── index.controller.js
|   ├── models/
│   │   ├── ModelExample.js
│   │   ├── ....
│   ├── routes/
│   │   ├── produto/
│   │   │   ├── id.route.js
│   │   ├── index.route.js
|   ├── schemas/
│   │   ├── products_schema.js
│   │   ├── ....
│   ├── services/
│   │   ├── ServiceExample.js
│   │   ├── ....
│   ├── app.js
├── package.json
├── .env
├── .gitignore
├── README.md
```
