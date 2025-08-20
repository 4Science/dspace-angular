import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { libraryRoutes } from '@nx-poc/routing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideRouter([
      ...appRoutes,
      ...libraryRoutes,
    ]),
  ],
};
