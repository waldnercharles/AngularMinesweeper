import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import {MinesweeperComponent} from './minesweeper/minesweeper.component';

export const routes: Routes = [
  { path: '', component: MinesweeperComponent },
];
