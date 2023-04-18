import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SnackBarData } from './SnackBarData';

@Component({
  selector: 'info-snack-bar',
  templateUrl: 'info-snack.component.html',
  styles: [
    `:host {
      display: flex;
    }
  `,
  ],
})
export class InfoSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData) { }
}