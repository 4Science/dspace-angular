import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { Item } from '../../../core/shared/item.model';
import { EditItemDataService } from '../../../core/submission/edititem-data.service';
import { EditItem } from '../../../core/submission/models/edititem.model';
import { EditItemMode } from '../../../core/submission/models/edititem-mode.model';
import { TranslateLoaderMock } from '../../mocks/translate-loader.mock';
import { NotificationsService } from '../../notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { NotificationsServiceStub } from '../../testing/notifications-service.stub';
import { createPaginatedList } from '../../testing/utils.test';
import { EditItemMenuComponent } from './edit-item-menu.component';

describe('EditItemMenuComponent', () => {
  let component: EditItemMenuComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<EditItemMenuComponent>;

  let editItemDataService: any;
  let dso: DSpaceObject;
  const notificationService = new NotificationsServiceStub();
  const editItemMode: EditItemMode = Object.assign(new EditItemMode(), {
    name: 'test',
    label: 'test',
  });

  const editItem: EditItem = Object.assign(new EditItem(), {
    modes: createSuccessfulRemoteDataObject$(createPaginatedList([editItemMode])),
  });

  const noEditItem: EditItem = Object.assign(new EditItem(), {
    modes: createSuccessfulRemoteDataObject$(createPaginatedList([])),
  });

  beforeEach(async(() => {
    dso = Object.assign(new Item(), {
      id: 'test-item',
      _links: {
        self: { href: 'test-item-selflink' },
      },
    });
    editItemDataService = jasmine.createSpyObj('EditItemDataService', {
      searchEditModesById: jasmine.createSpy('searchEditModesById'),
    });

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        RouterTestingModule.withRoutes([]),
        EditItemMenuComponent,
      ],
      providers: [
        { provide: EditItemDataService, useValue: editItemDataService },
        { provide: 'contextMenuObjectProvider', useValue: dso },
        { provide: 'contextMenuObjectTypeProvider', useValue: DSpaceObjectType.ITEM },
        { provide: NotificationsService, useValue: notificationService },
      ],
    }).compileComponents();
  }));

  describe('when edit modes are available', () => {
    beforeEach(() => {
      editItemDataService.searchEditModesById.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([editItemMode])));
      fixture = TestBed.createComponent(EditItemMenuComponent);
      component = fixture.componentInstance;
      componentAsAny = fixture.componentInstance;
      component.contextMenuObject = dso;
      fixture.detectChanges();
    });

    it('should init edit mode properly', () => {
      expect(componentAsAny.editModes$.value).toEqual([editItemMode]);
    });

    it('should render a button', () => {
      const link = fixture.debugElement.query(By.css('button'));
      expect(link).not.toBeNull();
    });
  });

  describe('when no edit modes are available', () => {
    beforeEach(() => {
      editItemDataService.searchEditModesById.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([])));
      fixture = TestBed.createComponent(EditItemMenuComponent);
      component = fixture.componentInstance;
      componentAsAny = fixture.componentInstance;
      component.contextMenuObject = dso;
      fixture.detectChanges();
    });

    it('should init edit mode properly', () => {
      expect(componentAsAny.editModes$.value).toEqual([]);
    });

    it('should render a button', () => {
      const link = fixture.debugElement.query(By.css('button'));
      expect(link).toBeNull();
    });

  });

});
