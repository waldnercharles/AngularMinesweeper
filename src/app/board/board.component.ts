import { Component, Input } from '@angular/core';
import { Cell } from '../services/minesweeper.service';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  @Input() cells: Cell[][] = [];
}
