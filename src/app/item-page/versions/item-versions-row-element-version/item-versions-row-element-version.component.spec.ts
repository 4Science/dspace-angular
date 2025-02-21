import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  BrowserModule,
  By,
} from '@angular/platform-browser';
import {
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  EMPTY,
  of as observableOf,
  of,
} from 'rxjs';

import { AuthorizationDataService } from '@dspace/core';
import { ItemDataService } from '@dspace/core';
import { VersionDataService } from '@dspace/core';
import { VersionHistoryDataService } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { Item } from '@dspace/core';
import { Version } from '@dspace/core';
import { VersionHistory } from '@dspace/core';
import { WorkflowItemDataService } from '@dspace/core';
import { WorkspaceitemDataService } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { ActivatedRouteStub } from '@dspace/core';
import { NotificationsServiceStub } from '@dspace/core';
import { createPaginatedList } from '@dspace/core';
import { ItemVersionsComponent } from '../item-versions.component';
import { ItemVersionsRowElementVersionComponent } from './item-versions-row-element-version.component';

describe('ItemVersionsRowElementVersionComponent', () => {
  let component: ItemVersionsRowElementVersionComponent;
  let fixture: ComponentFixture<ItemVersionsRowElementVersionComponent>;

  const versionHistory = Object.assign(new VersionHistory(), {
    id: '1',
    draftVersion: true,
  });

  const version = Object.assign(new Version(), {
    id: '1',
    version: 1,
    created: new Date(2020, 1, 1),
    summary: 'first version',
    versionhistory: createSuccessfulRemoteDataObject$(versionHistory),
    _links: {
      self: {
        href: 'version2-url',
      },
    },
  });

  versionHistory.versions = createSuccessfulRemoteDataObject$(createPaginatedList([version]));


  const item = Object.assign(new Item(), { // is a workspace item
    id: 'item-identifier-1',
    uuid: 'item-identifier-1',
    handle: '123456789/1',
    version: createSuccessfulRemoteDataObject$(version),
    _links: {
      self: {
        href: '/items/item-identifier-1',
      },
    },
  });

  version.item = createSuccessfulRemoteDataObject$(item);

  const versionHistoryServiceSpy = jasmine.createSpyObj('versionHistoryService', {
    getVersions: createSuccessfulRemoteDataObject$(createPaginatedList([version])),
    getVersionHistoryFromVersion$: of(versionHistory),
    getLatestVersionItemFromHistory$: of(item),
  });
  const authorizationServiceSpy = jasmine.createSpyObj('authorizationService', {
    isAuthorized: observableOf(true),
  });
  const workspaceItemDataServiceSpy = jasmine.createSpyObj('workspaceItemDataService', {
    findByItem: EMPTY,
  });
  const workflowItemDataServiceSpy = jasmine.createSpyObj('workflowItemDataService', {
    findByItem: EMPTY,
  });
  const versionServiceSpy = jasmine.createSpyObj('versionService', {
    findById: EMPTY,
  });
  const itemDataServiceSpy = jasmine.createSpyObj('itemDataService', {
    delete: createSuccessfulRemoteDataObject$({}),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterModule.forRoot([
        { path: 'items/:id/edit/versionhistory', component: {} as any },
      ]), CommonModule, FormsModule, ReactiveFormsModule, BrowserModule, ItemVersionsComponent],
      providers: [
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: AuthorizationDataService, useValue: authorizationServiceSpy },
        { provide: VersionHistoryDataService, useValue: versionHistoryServiceSpy },
        { provide: ItemDataService, useValue: itemDataServiceSpy },
        { provide: VersionDataService, useValue: versionServiceSpy },
        { provide: WorkspaceitemDataService, useValue: workspaceItemDataServiceSpy },
        { provide: WorkflowItemDataService, useValue: workflowItemDataServiceSpy },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ItemVersionsRowElementVersionComponent);
    component = fixture.componentInstance;

    component.version = version;
    component.itemVersion = version;
    component.item = item;
    component.displayActions = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should display version ${version.version} in the correct column for version ${version.id}`, () => {
    const id = fixture.debugElement.query(By.css(`.left-column`));
    expect(id.nativeElement.textContent).toContain(version.version.toString());
  });

  it(`should displau an asterisk in the correct column for current version`, () => {
    const draft = fixture.debugElement.query(By.css(`.left-column`));
    expect(draft.nativeElement.textContent).toContain('*');
  });

  it('should display action buttons in the correct column if displayActions is true', () => {
    fixture.detectChanges();
    const actions = fixture.debugElement.query(By.css(`.right-column`));
    expect(actions).toBeTruthy();
  });

  describe('when deleting a version', () => {
    let deleteButton;

    beforeEach(() => {
      deleteButton = fixture.debugElement.queryAll(By.css('.version-row-element-delete'))[0].nativeElement;

      itemDataServiceSpy.delete.calls.reset();
    });

    describe('if confirmed via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .confirm').click();
      }));

      it('should call ItemService.delete', () => {
        expect(itemDataServiceSpy.delete).toHaveBeenCalledWith(item.id);
      });
    });

    describe('if canceled via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .cancel').click();
      }));

      it('should not call ItemService.delete', () => {
        expect(itemDataServiceSpy.delete).not.toHaveBeenCalled();
      });
    });
  });

});
