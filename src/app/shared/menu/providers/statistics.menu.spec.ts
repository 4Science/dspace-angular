import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { ActivatedRouteStub } from '../../testing/active-router.stub';
import { StatisticsMenuProvider } from './statistics.menu';

describe('StatisticsMenuProvider', () => {
  let provider: StatisticsMenuProvider;
  let authorizationService: AuthorizationDataService;

  beforeEach(() => {
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: of(true),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        StatisticsMenuProvider,
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub({}, { }) },
      ],
    });
    provider = TestBed.inject(StatisticsMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });

  describe('getSectionsForContext', () => {
    it('should return menu entries when at least one authorization is granted', (done) => {
      provider.getSectionsForContext(undefined).subscribe((sections) => {
        expect(Array.isArray(sections)).toBeTrue();
        expect(sections.length).toBeGreaterThan(0);
        expect(sections.some((s) => s.id === 'statistics')).toBeTrue();
        done();
      });
    });

    it('should return an empty array when no authorizations are granted', (done) => {
      (TestBed.inject(AuthorizationDataService) as any).isAuthorized.and.returnValue(of(false));
      provider.getSectionsForContext(undefined).subscribe((sections) => {
        expect(sections).toEqual([]);
        done();
      });
    });
  });
});
