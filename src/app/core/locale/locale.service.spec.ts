import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { routeServiceStub } from '../../shared/testing/route-service.stub';
import { AuthService } from '../auth/auth.service';
import { CookieService } from '../services/cookie.service';
import { RouteService } from '../services/route.service';
import { NativeWindowRef } from '../services/window.service';
import {
  LANG_COOKIE,
  LANG_ORIGIN,
  LocaleService,
} from './locale.service';

describe('LocaleService test suite', () => {
  let service: LocaleService;
  let serviceAsAny: any;
  let cookieService: CookieService;
  let translateService: TranslateService;
  let window;
  let spyOnGet;
  let spyOnSet;
  let authService;
  let routeService;
  let document;
  let spyOnGetLanguage;


  const translateServiceStub: any = {
    getLangs: () => {
      return langList;
    },
    getBrowserLang: () => {
      return langList;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    use: (param: string) => {
    },
  };

  authService = jasmine.createSpyObj('AuthService', {
    isAuthenticated: jasmine.createSpy('isAuthenticated'),
    isAuthenticationLoaded: jasmine.createSpy('isAuthenticationLoaded'),
  });
  const langList = ['en', 'xx', 'de'];

  describe('with valid language', () => {

    beforeEach(waitForAsync(() => {
      return TestBed.configureTestingModule({
        imports: [
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useClass: TranslateLoaderMock,
            },
          }),
        ],
        providers: [
          { provide: CookieService, useValue: new CookieServiceMock() },
          { provide: AuthService, userValue: authService },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: TranslateService, useValue: translateServiceStub },
          { provide: Document, useValue: document },
        ],
      });
    }));

    beforeEach(() => {
      cookieService = TestBed.inject(CookieService);
      translateService = TestBed.inject(TranslateService);
      routeService = TestBed.inject(RouteService);
      window = new NativeWindowRef();
      document = { documentElement: { lang: 'en' } };
      service = new LocaleService(window, cookieService, translateService, authService, routeService, document);
      serviceAsAny = service;
      spyOnGet = spyOn(cookieService, 'get');
      spyOnSet = spyOn(cookieService, 'set');
      spyOnGetLanguage = spyOn(routeService, 'getQueryParameterValue').withArgs('lang');
    });

    describe('getCurrentLanguageCode', () => {
      it('should return language saved on cookie', () => {
        spyOnGet.and.returnValue('de');
        expect(service.getCurrentLanguageCode()).toBe('de');
      });

      describe('', () => {
        beforeEach(() => {
          spyOn(translateService, 'getLangs').and.returnValue(langList);
        });

        it('should return language from browser setting', () => {
          spyOn(translateService, 'getBrowserLang').and.returnValue('xx');
          expect(service.getCurrentLanguageCode()).toBe('xx');
        });

        it('should return default language from config', () => {
          spyOn(translateService, 'getBrowserLang').and.returnValue('fr');
          expect(service.getCurrentLanguageCode()).toBe('en');
        });
      });
    });

    describe('getLanguageCodeFromCookie', () => {
      it('should return language from cookie', () => {
        spyOnGet.and.returnValue('de');
        expect(service.getLanguageCodeFromCookie()).toBe('de');
      });

    });

    describe('saveLanguageCodeToCookie', () => {
      it('should save language to cookie', () => {
        service.saveLanguageCodeToCookie('en');
        expect(spyOnSet).toHaveBeenCalledWith(LANG_COOKIE, 'en');
      });
    });

    describe('setCurrentLanguageCode', () => {
      beforeEach(() => {
        spyOn(service, 'saveLanguageCodeToCookie');
        spyOn(translateService, 'use');
      });

      it('should set the given language', () => {
        service.setCurrentLanguageCode('it');
        expect(translateService.use).toHaveBeenCalledWith('it');
        expect(service.saveLanguageCodeToCookie).toHaveBeenCalledWith('it');
      });

      it('should set the current language', () => {
        spyOn(service, 'getCurrentLanguageCode').and.returnValue('es');
        service.setCurrentLanguageCode();
        expect(translateService.use).toHaveBeenCalledWith('es');
        expect(service.saveLanguageCodeToCookie).toHaveBeenCalledWith('es');
      });

      it('should set the current language on the html tag', () => {
        spyOn(service, 'getCurrentLanguageCode').and.returnValue('es');
        service.setCurrentLanguageCode();
        expect((service as any).document.documentElement.lang).toEqual('es');
      });

      describe('should set language on init', () => {
        beforeEach(() => {
          spyOn(translateService, 'getLangs').and.returnValue(langList);
          spyOn(service, 'setCurrentLanguageCode');
        });
        describe('whith correct lang query param ', () => {
          beforeEach(() => {
            spyOnGetLanguage.and.returnValue(observableOf('en'));
            service.initDefaults();
          });
          it('should set correct lang', () => {
            expect(service.setCurrentLanguageCode).toHaveBeenCalledWith('en');
          });
        });
        describe('whith wrong lang query param ', () => {
          beforeEach(() => {
            spyOnGetLanguage.and.returnValue(observableOf('abcd'));
            service.initDefaults();
          });
          it('should not set lang', () => {
            expect(service.setCurrentLanguageCode).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('', () => {
      it('should set quality to current language list', () => {
        const langListWithQuality = ['en;q=1', 'it;q=0.9', 'de;q=0.8'];
        spyOn(service, 'setQuality').and.returnValue(langListWithQuality);
        service.setQuality(langList, LANG_ORIGIN.BROWSER, false);
        expect(service.setQuality).toHaveBeenCalledWith(langList, LANG_ORIGIN.BROWSER, false);
      });

      it('should return the list of language with quality factor', () => {
        spyOn(service, 'getLanguageCodeList');
        service.getLanguageCodeList();
        expect(service.getLanguageCodeList).toHaveBeenCalled();
      });
    });
  });
});
