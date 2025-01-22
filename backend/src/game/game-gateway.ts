import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState } from './game-state';
import { Cell } from './cell';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  
  private gameState: GameState;

  afterInit(server: any)
  {
    this.gameState = new GameState();
  }
    
  handleConnection(client: Socket)
  {
    if (Object.keys(this.gameState.players).length >= 2)
    {
      client.emit('error', 'The game is already full.');
      client.disconnect();
    }
    else
    {
      const playerSymbol = this.gameState.currentPlayer;
      this.gameState.players[client.id] = playerSymbol;
      this.gameState.switchPlayer();
      client.emit('assigned', { symbol: playerSymbol });
    }
  }
  
  handleDisconnect(client: Socket)
  {
    this.resetGame();
  }

  private isValidMove(client: Socket, cell: Cell): boolean
  {
    if (cell.row < 0 || cell.row >= this.gameState.boardSize || cell.col < 0 || cell.col >= this.gameState.boardSize)
    {
      client.emit('error', 'invalid move - cell out of bounds');
      return false;
    }
    if (this.gameState.board[cell.row][cell.col] !== null)
    {
      client.emit('error', 'invalid move - cell is already occupied');
      return false;
    }
    return true;
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, @MessageBody() cell: Cell)
  {
    const playerSymbol = this.gameState.players[client.id];
    if (!playerSymbol)
    {
      client.emit('error', 'You are not part of the game');
      return;
    }

    if (!this.isValidMove(client, cell))
    {  
      return;
    }
  
    if (playerSymbol !== this.gameState.currentPlayer)
    {
      client.emit('error', 'Not your turn.');
      return;
    }
  
    this.gameState.makeMove(playerSymbol, cell);  
    this.server.emit('last-move', {
      player: playerSymbol,
      cell: cell
    });
  
    const winner = this.checkWinner();
    if (winner)
    {
      this.server.emit('game-over', { winner });
      this.resetGame();
    }
    else if (this.isDraw())
    {
      this.server.emit('game-over', 'no winner, game ended in draw');
      this.resetGame();
    }
  }
  
  private checkRow(row: number): boolean {
    const { board } = this.gameState;
    return board[row].every(cell => cell === board[row][0] && cell !== null);
  }

  private checkColumn(col: number): boolean {
    const { board } = this.gameState;
    return board.every(row => row[col] === board[0][col] && row[col] !== null);
  }

  private checkDiagonal(): boolean {
    const { board } = this.gameState;
    return board.every((row, i) => row[i] === board[0][0] && row[i] !== null);
  }

  private checkAntiDiagonal(): boolean
  {
    return this.gameState.board.every((row, i) => row[this.gameState.boardSize - 1 - i] === this.gameState.board[0][this.gameState.boardSize - 1] &&
      row[this.gameState.boardSize - 1 - i] !== null);
  }

  private checkWinner(): string | null
  {
    for (let i = 0; i < this.gameState.boardSize; ++i)
    {
      if (this.checkRow(i)) return this.gameState.board[i][0];
      if (this.checkColumn(i)) return this.gameState.board[0][i];
    }

    if (this.checkDiagonal()) return this.gameState.board[0][0];
    if (this.checkAntiDiagonal()) return this.gameState.board[0][this.gameState.boardSize - 1];

    return null;
  }
  
  private isDraw(): boolean
  {
    return this.gameState.board.every(row => row.every(cell => cell !== null));
  }
  
  private resetGame()
  {
    this.gameState.resetState();
  }
}