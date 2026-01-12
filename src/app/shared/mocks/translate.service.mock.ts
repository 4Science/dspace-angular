import { EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

export function getMockTranslateService(): TranslateService {
  const service: any = {
    get: jasmine.createSpy('get').and.callFake((key: any, interpolateParams?: object) => of(key)),
    use: jasmine.createSpy('use'),
    instant: jasmine.createSpy('instant').and.callFake((key: any, interpolateParams?: object) => key),
    setFallbackLang: jasmine.createSpy('setFallbackLang'),
    onLangChange: new EventEmitter<any>(),
    onTranslationChange: new EventEmitter<any>(),
    onDefaultLangChange: new EventEmitter<any>(),
  };
  return service as TranslateService;
}
