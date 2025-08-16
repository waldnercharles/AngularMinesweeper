import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cell } from '../services/minesweeper.service';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  @Input() cells: Cell[][] = [];
  @Output() cellClick = new EventEmitter<{row: number, col: number}>();

  onCellClick(row: number, col: number): void {
    this.cellClick.emit({row, col});
  }
}
