/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../../../../config/app-config.interface';
import { createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { createPaginatedList } from '../../testing/utils.test';
import { ExploreMenuProvider } from './explore.menu';
import { environment } from '../../../../environments/environment';
import { SectionDataService } from '../../../core/layout/section-data.service';

describe('ExploreMenuProvider', () => {

  let provider: ExploreMenuProvider;
  let sectionDataServiceStub = {
    findVisibleSections: () => createSuccessfulRemoteDataObject$(createPaginatedList([])),
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExploreMenuProvider,
        { provide: APP_CONFIG, useValue: environment },
        { provide: SectionDataService, useValue: sectionDataServiceStub },
      ],
    });
    provider = TestBed.inject(ExploreMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });
});
