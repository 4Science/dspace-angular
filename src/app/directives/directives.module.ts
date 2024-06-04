import { RedirectWithHrefDirective } from './redirect/redirect-href.directive';
import { RedirectDirective } from './redirect/redirect.directive';
import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationHelper } from '../shared/translate/missing-translation.helper';
import { TextSelectDirective } from './text-select/text-select.directive';

const DIRECTIVES = [
  RedirectDirective,
  RedirectWithHrefDirective,
  TextSelectDirective,
];

@NgModule({
  declarations: [
    ...DIRECTIVES,
  ],
  imports: [
    TranslateModule.forChild({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationHelper },
      useDefaultLang: true
    }),
  ],
  exports: [
    ...DIRECTIVES,
  ]
})
export class DirectivesModule {
}
