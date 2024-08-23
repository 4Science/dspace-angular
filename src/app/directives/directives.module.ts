import { NgModule } from '@angular/core';
import {
  MissingTranslationHandler,
  TranslateModule,
} from '@ngx-translate/core';

import { MissingTranslationHelper } from '../shared/translate/missing-translation.helper';
import { RedirectDirective } from './redirect/redirect.directive';
import { RedirectWithHrefDirective } from './redirect/redirect-href.directive';

const DIRECTIVES = [
  RedirectDirective,
  RedirectWithHrefDirective,
];

@NgModule({
  imports: [
    TranslateModule.forChild({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationHelper },
      useDefaultLang: true,
    }),
    ...DIRECTIVES,
  ],
  exports: [
    ...DIRECTIVES,
  ],
})
export class DirectivesModule {
}
