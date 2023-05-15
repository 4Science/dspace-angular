import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { createSuccessfulRemoteDataObject } from '../../../shared/remote-data.utils';
import { ActivatedRoute } from '@angular/router';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { ItemCurateComponent } from './item-curate.component';
import { Item } from '../../../core/shared/item.model';

describe('ItemCurateComponent', () => {
  let comp: ItemCurateComponent;
  let fixture: ComponentFixture<ItemCurateComponent>;
  let debugEl: DebugElement;

  let routeStub;
  let dsoNameService;

  const item = Object.assign(new Item(), {
    metadata: {'dc.title': ['Item Name']}
  });

  beforeEach(waitForAsync(() => {
    routeStub = {
      parent: {
        data: observableOf({
          dso: createSuccessfulRemoteDataObject(item)
        })
      }
    };

    dsoNameService = jasmine.createSpyObj('dsoNameService', {
      getName: 'Item Name'
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ItemCurateComponent],
      providers: [
        {provide: ActivatedRoute, useValue: routeStub},
        {provide: DSONameService, useValue: dsoNameService}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCurateComponent);
    comp = fixture.componentInstance;
    debugEl = fixture.debugElement;

    fixture.detectChanges();
  });
  describe('init', () => {
    it('should initialise the comp', () => {
      expect(comp).toBeDefined();
      expect(debugEl.nativeElement.innerHTML).toContain('ds-curation-form');
    });
    it('should contain the item information provided', () => {
      comp.itemRD$.subscribe((value) => {
        expect(value.payload).toBeTruthy();
      });
      comp.itemName$.subscribe((value) => {
        expect(value).toEqual('Item Name');
      });
    });
  });
});
