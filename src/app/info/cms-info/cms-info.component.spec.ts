import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsInfoComponent } from './cms-info.component';
import { SiteDataService } from 'src/app/core/data/site-data.service';
import { LocaleService } from 'src/app/core/locale/locale.service';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from 'src/app/shared/testing/active-router.stub';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { CookieServiceMock } from 'src/app/shared/mocks/cookie.service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthTokenInfo } from 'src/app/core/auth/models/auth-token-info.model';
import { Observable, of as observableOf, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Site } from 'src/app/core/shared/site.model';

describe('CmsInfoComponent', () => {
  let component: CmsInfoComponent;
  let fixture: ComponentFixture<CmsInfoComponent>;
  let authService: AuthService;
  let token: AuthTokenInfo;
  let store;
  let route: ActivatedRoute;
  let redirectUrl: string;

  let siteServiceStub: any;

  const site: Site = Object.assign(new Site(), {
    metadata: {
      'dc.rights' : [{
        value: 'English text',
        language: 'en'
      },
      {
        value: 'German text',
        language: 'de'
      }]
    }
  });

  beforeEach(async () => {
    redirectUrl = 'redirect/url';
    token = new AuthTokenInfo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
      getToken: token
    });
    store = jasmine.createSpyObj('store', ['dispatch']);
    route = Object.assign(new ActivatedRouteStub(), {
      queryParams: observableOf({
        redirect: redirectUrl
      })
    }) as any;
    siteServiceStub = {
      find(): Observable<Site> {
        return of(site);
      }
    };
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ CmsInfoComponent ],
      providers: [
        LocaleService,
        ObjectCacheService,
        { provide: SiteDataService, useValue: siteServiceStub },
        { provide: Store, useValue: store },
        { provide: AuthService, useValue: authService },
        { provide: CookieService, useValue: new CookieServiceMock },
        { provide: NativeWindowService, useValue: new NativeWindowRef() },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
