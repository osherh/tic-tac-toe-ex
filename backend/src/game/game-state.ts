import { Cell } from "./cell";

//TODO: make it a singleton, maybe use a factory method
export class GameState
{
  boardSize: number = 3; //TODO: use ConfigModule
  board: string[][];
  currentPlayer: string;
  players: { [socketId: string]: string };

  constructor()
  {
    this.board = this.createEmptyBoard(this.boardSize); 
    this.currentPlayer = 'X';
    this.players = {};
  }

  createEmptyBoard(boardSize): string[][]
  {
    return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
  }
   
  resetState()
  {
    this.board = this.createEmptyBoard(this.boardSize); 
    this.currentPlayer = 'X';
    this.players = {};
  }
  
  makeMove(player: string, cell: Cell): void
  {	  
      this.board[cell.row][cell.col] = player;
      this.switchPlayer();
  }

  switchPlayer()
  {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }
}