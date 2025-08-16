import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Cell {
  row: number;
  col: number;
  isRevealed: boolean;
  hasFlag: boolean;
  hasMine: boolean;
  adjacentMines: number;
}

@Injectable({
  providedIn: 'root'
})
export class MinesweeperService {
  private readonly boardSubject = new BehaviorSubject<Cell[][]>([]);

  readonly board$ = this.boardSubject.asObservable();

  newGame(rows: number, cols: number, mineCount: number): void {
    let board = this.createEmptyBoard(rows, cols);
    board = this.placeMines(board, rows, cols, mineCount);
    this.boardSubject.next(board);
  }

  revealCell(row: number, col: number): void {
    const board = this.deepCopy(this.boardSubject.getValue());
    const selectedCell = board[row][col];
    if (selectedCell.isRevealed || selectedCell.hasFlag) return;

    if (selectedCell.hasMine) {
      // TODO: Lose
      this.boardSubject.next(board);
      return;
    }

    // const queue: [number, number][] = [[row, col]];
    // while (queue.length > 0) {
    //   const [x, y] = queue.shift()!;
    //   const cell = board[x][y];
    //
    //   if (cell.isRevealed || cell.isFlagged) continue;
    //   cell.isRevealed = true;
    //
    //   if (!cell.hasMine && cell.adjacentMines == 0) {
    //
    //   }
    // }
  }

  toggleFlag(row: number, col: number): void {
  }

  private forEachNeighbor(cells: Cell[][], row: number, col: number, fn: (row: number, cell: number) => void) {
    const rows = cells.length;
    const cols = cells[0]?.length ?? 0;
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow == 0 && deltaCol == 0) continue;
        const r = row + deltaRow;
        const c = col + deltaCol;

        if (r >= 0 && r < rows && c >= 0 && c < cols)
          fn(r, c);
      }
    }
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
          hasFlag: false,
          hasMine: false,
          adjacentMines: 0,
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

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = next[row][col];
       if (cell.hasMine) {
         cell.adjacentMines = 0;
       } else {
         // TODO: This might be easier to understand without forEachNeighbor and in its own function.
         let count = 0;
         this.forEachNeighbor(next,  row,  col,  (r, c) => {
           if (next[r][c].hasMine) count++;
         });
         next[row][col].adjacentMines = count;
       }
      }
    }

    return next;
  }

  // Deep copy the board. This is useful because we want our store to emit a new board, new rows, and new cell objects.
  private deepCopy(board: Cell[][]): Cell[][] {
    return board.map((row) => row.map((cell) => ({...cell})));
  }
}
