import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@nx-poc/ui-common';

@Component({
  selector: 'lib-test-lib',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './test-lib.component.html',
  styleUrl: './test-lib.component.css',
})
export class TestLibComponent {}
