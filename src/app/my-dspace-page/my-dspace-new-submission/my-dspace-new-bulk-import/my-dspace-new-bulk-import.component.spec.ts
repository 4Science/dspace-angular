import { CommonModule } from '@angular/common';
import {
  Component,
  DebugElement,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { EntityTypeDataService } from '../../../core/data/entity-type-data.service';
import { ItemExportFormatService } from '../../../core/itemexportformat/item-export-format.service';
import { ItemType } from '../../../core/shared/item-relationships/item-type.model';
import { PageInfo } from '../../../core/shared/page-info.model';
import { ResourceType } from '../../../core/shared/resource-type';
import { EntityDropdownComponent } from '../../../shared/entity-dropdown/entity-dropdown.component';
import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import {
  createPaginatedList,
  createTestComponent,
} from '../../../shared/testing/utils.test';
import { MyDSpaceNewBulkImportComponent } from './my-dspace-new-bulk-import.component';

export function getMockEntityTypeService(): EntityTypeDataService {
  const type1: ItemType = {
    id: '1',
    label: 'Publication',
    uuid: '1',
    type: new ResourceType('entitytype'),
    _links: undefined,
  };
  const type2: ItemType = {
    id: '2',
    label: 'Journal',
    uuid: '2',
    type: new ResourceType('entitytype'),
    _links: undefined,
  };
  const type3: ItemType = {
    id: '2',
    label: 'DataPackage',
    uuid: '2',
    type: new ResourceType('entitytype'),
    _links: undefined,
  };
  const rd$ = createSuccessfulRemoteDataObject$(createPaginatedList([type1, type2, type3]));
  return jasmine.createSpyObj('entityTypeService', {
    getAllAuthorizedRelationshipType: rd$,
    hasMoreThanOneAuthorized: observableOf(true),
  });
}

export function getMockEmptyEntityTypeService(): EntityTypeDataService {
  const pageInfo = { elementsPerPage: 20, totalElements: 1, totalPages: 1, currentPage: 0 } as PageInfo;
  const type1: ItemType = {
    id: '1',
    label: 'Publication',
    uuid: '1',
    type: new ResourceType('entitytype'),
    _links: undefined,
  };
  const rd$ = createSuccessfulRemoteDataObject$(createPaginatedList([type1]));
  return jasmine.createSpyObj('entityTypeService', {
    getAllAuthorizedRelationshipType: rd$,
    hasMoreThanOneAuthorized: observableOf(false),
  });
}

describe('MyDSpaceNewBulkImportComponent test', () => {
  let testComp: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let submissionComponent: MyDSpaceNewBulkImportComponent;
  let submissionComponentFixture: ComponentFixture<MyDSpaceNewBulkImportComponent>;

  const entityType1: ItemType = {
    id: '1',
    label: 'Publication',
    uuid: '1',
    type: new ResourceType('entitytype'),
    _links: undefined,
  };

  const modalStub = {
    open: () => null,
    close: () => null,
    dismiss: () => null,
  };

  describe('With only one Entity', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          TranslateModule.forRoot(),
          MyDSpaceNewBulkImportComponent,
          TestComponent,
        ],
        providers: [
          { provide: EntityTypeDataService, useValue: getMockEmptyEntityTypeService() },
          { provide: NgbModal, useValue: modalStub },
          { provide: ItemExportFormatService, useValue: {} },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).overrideComponent(MyDSpaceNewBulkImportComponent, { remove: { imports: [EntityDropdownComponent] } })
        .compileComponents();

      const html = `<ds-my-dspace-new-bulk-import></ds-my-dspace-new-bulk-import>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;

      submissionComponentFixture = TestBed.createComponent(MyDSpaceNewBulkImportComponent);
      submissionComponent = submissionComponentFixture.componentInstance;
      submissionComponentFixture.detectChanges();
    }));

    afterEach(() => {
      testFixture.destroy();
      submissionComponentFixture.destroy();
    });

    it('should create MyDSpaceNewBulkImportComponent', () => {
      expect(submissionComponent).toBeDefined();
    });

    it('should be a single button', () => {
      submissionComponentFixture.detectChanges();
      const addDivElement: DebugElement = submissionComponentFixture.debugElement.query(By.css('.add'));
      const addDiv = addDivElement.nativeElement;
      expect(addDiv.innerHTML).toBeDefined();
      const buttonElement: DebugElement = addDivElement.query(By.css('.btn'));
      const button = buttonElement.nativeElement;
      expect(button.innerHTML).toBeDefined();
      const dropdownElement: DebugElement = submissionComponentFixture.debugElement.query(By.css('.dropdown-menu'));
      expect(dropdownElement).toBeNull();
    });
  });

  describe('With more than one Entity', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          TranslateModule.forRoot(),
          MyDSpaceNewBulkImportComponent,
          TestComponent,
        ],
        providers: [
          { provide: EntityTypeDataService, useValue: getMockEntityTypeService() },
          { provide: NgbModal, useValue: modalStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).overrideComponent(MyDSpaceNewBulkImportComponent, { remove: { imports: [EntityDropdownComponent] } })
        .compileComponents();

      const html = `<ds-my-dspace-new-bulk-import></ds-my-dspace-new-bulk-import>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;

      submissionComponentFixture = TestBed.createComponent(MyDSpaceNewBulkImportComponent);
      submissionComponent = submissionComponentFixture.componentInstance;
      submissionComponentFixture.detectChanges();
    }));

    afterEach(() => {
      testFixture.destroy();
      submissionComponentFixture.destroy();
    });

    it('should create MyDSpaceNewBulkImportComponent', () => {
      expect(submissionComponent).toBeDefined();
    });

    it('should be a dropdown button', () => {
      const dropdownElement: DebugElement = submissionComponentFixture.debugElement.query(By.css('.dropdown-menu'));
      const dropdown = dropdownElement.nativeElement;
      expect(dropdown.innerHTML).toBeDefined();
    });

    it('should invoke modalService.open', () => {
      spyOn((submissionComponent as any).modalService, 'open').and.returnValue({ componentInstance: {  } });
      submissionComponent.openDialog(entityType1);

      expect((submissionComponent as any).modalService.open).toHaveBeenCalled();
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [CommonModule],
})
class TestComponent {
  reload = (event) => {
    return;
  };
}
