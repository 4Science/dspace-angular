import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Collection } from '../../../../core/shared/collection.model';
import { Item } from '../../../../core/shared/item.model';
import { SearchService } from '../../../../core/shared/search/search.service';
import { getMockThemeService } from '../../../../shared/mocks/theme-service.mock';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../../../shared/testing/notifications-service.stub';
import { SearchServiceStub } from '../../../../shared/testing/search-service.stub';
import { ThemeService } from '../../../../shared/theme-support/theme.service';
import { DSOSelectorComponent } from '../../dso-selector/dso-selector.component';
import { ImportBatchSelectorComponent } from './import-batch-selector.component';

describe('ImportBatchSelectorComponent', () => {
  let component: ImportBatchSelectorComponent;
  let fixture: ComponentFixture<ImportBatchSelectorComponent>;
  const mockItem = Object.assign(new Item(), {
    id: 'fake-id',
    uuid: 'fake-id',
    handle: 'fake/handle',
    lastModified: '2018',
  });
  const mockCollection: Collection = Object.assign(new Collection(), {
    id: 'test-collection-1-1',
    uuid: 'test-collection-1-1',
    name: 'test-collection-1',
    metadata: {
      'dc.identifier.uri': [
        {
          language: null,
          value: 'fake/test-collection-1',
        },
      ],
    },
  });
  const modalStub = jasmine.createSpyObj('modalStub', ['close']);
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule.withRoutes([]), ImportBatchSelectorComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub },
        { provide: SearchService, useValue: new SearchServiceStub() },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: ThemeService, useValue: getMockThemeService() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ImportBatchSelectorComponent, { remove: { imports: [DSOSelectorComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportBatchSelectorComponent);
    component = fixture.componentInstance;
    spyOn(component.response, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('if item is selected', () => {
    beforeEach((done) => {
      component.navigate(mockItem).subscribe(() => {
        done();
      });
    });
    it('should emit null value', () => {
      expect(component.response.emit).toHaveBeenCalledWith(null);
    });
  });

  describe('if collection is selected', () => {
    beforeEach((done) => {
      component.navigate(mockCollection).subscribe(() => {
        done();
      });
    });
    it('should emit collection value', () => {
      expect(component.response.emit).toHaveBeenCalledWith(mockCollection);
    });
  });

});
