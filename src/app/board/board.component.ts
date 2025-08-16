import { Component } from '@angular/core';

interface Cell {
  row: number;
  col: number;
  isRevealed: boolean;
  isFlagged: boolean;
  hasMine: boolean;
}

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})


export class BoardComponent {
  readonly cells: Cell[][] = [];
  constructor() {
    this.cells = this.initializeCells();
  }

  private initializeCells(): Cell[][] {
    const rows = 10;
    const cols = 10;

    const cells: Cell[][] = [];
    for (let row = 0; row < rows; row++) {
      cells[row] = [];
      for (let col = 0; col < cols; col++) {
        cells[row][col] = {
          row,
          col,
          isRevealed: false,
          isFlagged: false,
          hasMine: false
        };
      }
    }
    return cells;
  }
}
