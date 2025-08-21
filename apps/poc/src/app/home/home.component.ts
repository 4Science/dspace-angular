import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent, HeaderComponent } from '@nx-poc/ui-common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
