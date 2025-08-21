import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent, HeaderComponent } from '@nx-poc/ui-common';

@Component({
  selector: 'lib-test-lib',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ContentComponent],
  templateUrl: './test-lib.component.html',
  styleUrl: './test-lib.component.css',
})
export class TestLibComponent {}
