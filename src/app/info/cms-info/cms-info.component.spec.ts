import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import {
  Observable,
  of as observableOf,
  of,
} from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthTokenInfo } from 'src/app/core/auth/models/auth-token-info.model';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { SiteDataService } from 'src/app/core/data/site-data.service';
import { LocaleService } from 'src/app/core/locale/locale.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from 'src/app/core/services/window.service';
import { Site } from 'src/app/core/shared/site.model';
import { CookieServiceMock } from 'src/app/shared/mocks/cookie.service.mock';

import { MarkdownViewerComponent } from '../../shared/markdown-viewer/markdown-viewer.component';
import { CmsInfoComponent } from './cms-info.component';

describe('CmsInfoComponent', () => {
  let component: CmsInfoComponent;
  let fixture: ComponentFixture<CmsInfoComponent>;
  let authService: AuthService;
  let token: AuthTokenInfo;
  let store;
  let redirectUrl: string;
  let activatedRouteStub: any;
  let siteServiceStub: any;

  const site: Site = Object.assign(new Site(), {
    metadata: {
      'dc.rights' : [{
        value: 'English text',
        language: 'en',
      },
      {
        value: 'German text',
        language: 'de',
      }],
    },
  });

  beforeEach(async () => {
    redirectUrl = 'redirect/url';
    token = new AuthTokenInfo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
      getToken: token,
    });
    store = jasmine.createSpyObj('store', ['dispatch']);
    activatedRouteStub = {
      data: observableOf({ schema: 'cris', qualifier: 'testQualifier' }),
      queryParamMap: observableOf({}),
    };
    siteServiceStub = {
      find(): Observable<Site> {
        return of(site);
      },
    };
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CmsInfoComponent,
        MockComponent(MarkdownViewerComponent),
      ],
      providers: [
        LocaleService,
        ObjectCacheService,
        { provide: SiteDataService, useValue: siteServiceStub },
        { provide: Store, useValue: store },
        { provide: AuthService, useValue: authService },
        { provide: CookieService, useValue: new CookieServiceMock },
        { provide: NativeWindowService, useValue: new NativeWindowRef() },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CmsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set headLabel$ when data is successfully retrieved', () => {
    const headLabelSpy = spyOn(component.headLabel$, 'next');

    component.ngOnInit();

    expect(headLabelSpy).toHaveBeenCalledOnceWith('info.testQualifier.head');
  });

  it('should log a warning to console if metadata content is missing', () => {
    spyOn(console, 'warn');
    site.metadata['cris.cms.testQualifier'] = undefined;

    component.ngOnInit();

    expect(console.warn).toHaveBeenCalledWith('Metadata cris.cms.testQualifier has no content');
  });
});
