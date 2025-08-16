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

  constructor() {
    const rows = 10;
    const cols = 10;
    const mines = rows * cols * 0.15;

    this.minesweeperService.newGame(rows, cols, mines);
  }
}
