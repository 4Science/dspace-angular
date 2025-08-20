import { HomeComponent } from './home/home.component';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: '',
    loadChildren: () =>
      import('@nx-poc/test-lib').then(
        (m) => m.testLibRoutes
      ),
  },
];
