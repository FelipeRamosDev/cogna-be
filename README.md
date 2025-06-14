# Cogna - Teste Tecnico - Backend
O projeto foi desenvolvido utilizando Node.js e Express, com foco em modularidade e escalabilidade. As rotas e controllers são carregados automaticamente, permitindo fácil manutenção e expansão. A arquitetura separa claramente as responsabilidades, e a inicialização do servidor é centralizada na classe `APIServer`, que gerencia todo o ciclo de vida da aplicação.

## Instalação sem Docker
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
3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente, se a variável `PORT` não estiver definida, a porta padrão será 8000:
   ```env
   PORT=<PORT>
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```

## Principais decisões técnicas
- Utilização de carregamento automático (auto-loading) para rotas e controllers, facilitando a escalabilidade e manutenção do projeto.
- Estrutura modular, permitindo a adição de novas rotas e controllers sem necessidade de alterações manuais no arquivo principal.
- Separação clara de responsabilidades entre definição de rotas, lógica de controle e inicialização do servidor.

#### Carregamento Automático de Rotas e Controllers
- As rotas e controllers são carregados dinamicamente a partir de diretórios específicos.
- O sistema percorre os diretórios de rotas e controllers, importando automaticamente todos os arquivos encontrados.
- Isso elimina a necessidade de registrar manualmente cada rota ou controller, reduzindo erros e facilitando a expansão do sistema.
- Os arquivos de controllers e rotas devem seguir as extensões `*.controller.js` e `*.route.js`, respectivamente, para serem automaticamente identificados e carregados pelo sistema.

#### Serviço Principal: Classe `APIServer`
- A classe `APIServer` é responsável por inicializar e configurar o servidor da API.
- Gerencia o ciclo de vida do servidor, incluindo o carregamento das rotas, controllers e middlewares necessários.
- Centraliza a configuração do servidor, tornando o ponto de entrada único e facilitando testes e manutenção.
- Garante que todas as dependências estejam corretamente carregadas antes de iniciar o serviço de escuta de requisições.

## Estrutura do Projeto
```   plaintext
cogna-be/
├── src/
│   ├── controllers/
│   │   ├── produto/
│   │   │   ├── id.controller.js
│   │   ├── index.controller.js
│   ├── routes/
│   │   ├── produto/
│   │   │   ├── id.route.js
│   │   ├── index.route.js
│   ├── services/
│   │   ├── APIServer.js
│   │   ├── Route.js
│   ├── app.js
├── package.json
├── .env
├── .gitignore
├── README.md
```
