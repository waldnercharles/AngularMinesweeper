import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BoardComponent } from '../board/board.component';
import { MinesweeperService } from '../services/minesweeper.service';

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [BoardComponent, AsyncPipe],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.css'
})
export class MinesweeperComponent {
  readonly minesweeperService = inject(MinesweeperService);

  readonly rows = 10;
  readonly cols = 10;
  readonly mines = this.rows * this.cols * 0.15;

  constructor() {
    this.minesweeperService.newGame(this.rows, this.cols, this.mines);
  }

  onCellClick(event: {row: number, col: number}): void {
    this.minesweeperService.revealCell(event.row, event.col);
  }

  onFlagClick(event: {row: number, col: number}): void {
    this.minesweeperService.toggleFlag(event.row, event.col);
  }

  onRestart(): void {
    this.minesweeperService.newGame(this.rows, this.cols, this.mines);
  }
}
