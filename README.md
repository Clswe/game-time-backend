# game-time

**game-time** é uma API que administra um jogo baseado em turnos para vários jogadores. Cada participante tem um tempo estipulado para executar uma jogada, e o jogador que acumular o maior tempo é eliminado. O jogo prossegue até que só haja um participante, que será declarado vencedor. A troca de informações entre o backend e o frontend ocorre por meio de WebSocket, enquanto as ações do jogo são gerenciadas por meio de solicitações HTTP.

## Node.js versão 20.16

Este projeto foi desenvolvido utilizando o Node.js versão 20.16. Certifique-se de ter esta versão instalada no seu ambiente de desenvolvimento.

### Requisitos

- **Node.js** versão 20.16 ou superior
- **npm** ou **yarn**
- **WebSocket** para comunicação em tempo real

### Instalação

Para rodar o projeto localmente, siga os seguintes passos:

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd game-time

2. Instale as dependências:
   ```bash
   npm install
3. Inicie o servidor em ambiente de desenvolvimento utilizando o nodemon:
   ```bash
   nodemon server.js
## Endpoints

base_url: http://localhost:5000/api/


### GET
Listar todos os jogadores registrados.


{{base_url}}players

----------------------------------------------------------------------------------------

### POST
Registrar um novo jogador no sistema. O jogador é criado sem o socketId inicialmente.

{{base_url}}players/register



Body
raw (json)
json
{
    "name": "cristian"
}

---------------------------------------------------------------------------------------
### POST
iniciaPartida

{{base_url}}players/start

Iniciar o jogo. São necessários pelo menos 2 jogadores registrados.


---------------------------------------------------------------------------------------

### POST
registraTempoJogador

{{base_url}}players/play

Registrar a jogada de um jogador, incluindo o tempo de reação.

Body
raw (json)
json
{
  "playerId": "67722f9e3eb705be59600b4d",
  "reactionTime": 5
}

---------------------------------------------------------------------------------------
### POST
Finalizar o jogo. Retorna o(s) vencedor(es), que são os jogadores com o menor tempo acumulado (até 30 segundos).
{{base_url}}players/end



Body
raw (json)
json
{
  "playerId": "id_do_jogador",
  "reactionTime": 5
}

---------------------------------------------------------------------------------------
### GET
Obtem status dos jogadores
{{base_url}}players/game-status



---------------------------------------------------------------------------------------

### GET
listaJogadoresEliminados
{{base_url}}players/eliminated

