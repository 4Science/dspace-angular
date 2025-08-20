import { Route } from '@angular/router';


export const libraryRoutes : Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@nx-poc/test-lib').then((m) => m.testLibRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('@nx-poc/feature-a').then((m) => m.featureARoutes),
  },
]
