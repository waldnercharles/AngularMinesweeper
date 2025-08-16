import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Cell {
  row: number;
  col: number;
  isRevealed: boolean;
  isFlagged: boolean;
  hasMine: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MinesweeperService {
  private readonly cellsSubject = new BehaviorSubject<Cell[][]>([]);
  readonly cells$ = this.cellsSubject.asObservable();

  newGame(rows: number, cols: number, mineCount: number): void {
    let board = this.createEmptyBoard(rows, cols);
    board = this.placeMines(board, rows, cols, mineCount);
    this.cellsSubject.next(board);
  }

  revealCell(row: number, col: number): void {
  }

  toggleFlag(row: number, col: number): void {
  }

  // TODO: Not sure if we'll need this in the end... Maybe just move everything into newGame?
  private createEmptyBoard(rows: number, cols: number): Cell[][] {
    const cells: Cell[][] = [];
    for (let row = 0; row < rows; row++) {
      cells[row] = [];
      for (let col = 0; col < cols; col++) {
        cells[row][col] = {
          row,
          col,
          isRevealed: true,
          isFlagged: false,
          hasMine: false
        };
      }
    }
    return cells;
  }

  private placeMines(board: Cell[][], rows: number, cols: number, mineCount: number): Cell[][] {
    const next = this.deepCopy(board);

    // We need this array to avoid selecting the same position for two different mines
    const positions: { row: number, col: number }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({row, col});
      }
    }

    // Randomly select positions for mines
    for (let i = 0; i < mineCount && i < positions.length; i++) {
      const rnd = Math.floor(Math.random() * positions.length);
      const {row, col} = positions[rnd];

      next[row][col].hasMine = true;
      positions.splice(rnd, 1);
    }

    return next;
  }

  // Deep copy the board. This is useful because we want our store to emit a new board, new rows, and new cell objects.
  private deepCopy(board: Cell[][]): Cell[][] {
    return board.map((row) => row.map((cell) => ({...cell})));
  }
}
