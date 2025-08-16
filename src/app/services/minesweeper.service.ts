import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {map, distinctUntilChanged} from 'rxjs/operators';

export interface Cell {
  row: number;
  col: number;
  isRevealed: boolean;
  hasFlag: boolean;
  hasMine: boolean;
  adjacentMines: number;
  isExploded: boolean;
}

export type GameState = 'playing' | 'won' | 'lost';

@Injectable({
  providedIn: 'root'
})
export class MinesweeperService {
  private readonly boardSubject = new BehaviorSubject<Cell[][]>([]);

  readonly board$ = this.boardSubject.asObservable();

  // This is not how I'd normally manage state, but, I'm forcing some RXJS into my code.
  readonly gameState$ = this.board$.pipe(
    map(board => this.getGameState(board)),
    distinctUntilChanged()
  );

  newGame(rows: number, cols: number, mineCount: number): void {
    let board = this.createEmptyBoard(rows, cols);
    board = this.placeMines(board, rows, cols, mineCount);
    this.boardSubject.next(board);
  }

  revealCell(row: number, col: number): void {
    const currentBoard = this.boardSubject.getValue();
    const currentState = this.getGameState(currentBoard);
    if (currentState !== 'playing') return;

    const next = this.deepCopy(currentBoard);
    const selectedCell = next[row][col];
    if (selectedCell.isRevealed || selectedCell.hasFlag) return;

    if (selectedCell.hasMine) {
      selectedCell.isExploded = true;
      // Reveal all the mines
      for (let r = 0; r < next.length; r++) {
        for (let c = 0; c < next[r].length; c++) {
          if (next[r][c].hasMine) {
            next[r][c].isRevealed = true;
          }
        }
      }
      this.boardSubject.next(next);

      return;
    }

    // Reveal our cell and all its neighbors that don't have any mines near them; recursively.
    // Using a queue here to avoid a recursive function.
    const queue: [number, number][] = [[row, col]];
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const testCell = next[x][y];

      if (testCell.isRevealed || testCell.hasFlag) continue;
      testCell.isRevealed = true;

      if (!testCell.hasMine && testCell.adjacentMines == 0) {
        this.forEachNeighbor(next, x, y, (r, c) => {
          const neighborCell = next[r][c];
          if (!neighborCell.isRevealed && !neighborCell.hasFlag) {
            queue.push([r, c]);
          }
        });
      }
    }

    this.boardSubject.next(next);
  }

  toggleFlag(row: number, col: number): void {
    const next = this.deepCopy(this.boardSubject.getValue());
    const cell = next[row][col];
    if (cell.isRevealed) return;
    cell.hasFlag = !cell.hasFlag;
    this.boardSubject.next(next);
  }

  private getGameState(board: Cell[][]): GameState {
    if (board.length === 0) return 'playing';

    const hasExplodedMine = board.flat().some(cell => cell.isExploded);
    if (hasExplodedMine) return 'lost';

    const isFullyRevealed = board.flat()
      .filter(cell => !cell.hasMine)
      .every(cell => cell.isRevealed);

    return isFullyRevealed ? 'won' : 'playing';
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
          isRevealed: false,
          hasFlag: false,
          hasMine: false,
          adjacentMines: 0,
          isExploded: false,
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
