import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@nx-poc/ui-common';

@Component({
  selector: 'lib-feature-a',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './feature-a.component.html',
  styleUrl: './feature-a.component.css',
})
export class FeatureAComponent {}
