import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { of as observableOf } from 'rxjs';

import { ViewMode } from '../../core/shared/view-mode.model';
import { RouterStub } from '../testing/router.stub';
import { ObjectCollectionComponent } from './object-collection.component';

describe('ObjectCollectionComponent', () => {
  let fixture: ComponentFixture<ObjectCollectionComponent>;
  let objectCollectionComponent: ObjectCollectionComponent;

  const queryParam = 'test query';
  const scopeParam = '7669c72a-3f2a-451f-a3b9-9210e7a4c02f';
  const activatedRouteStub = {
    queryParams: observableOf({
      query: queryParam,
      scope: scopeParam,
    }),
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectCollectionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useClass: RouterStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();  // compile template and css
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectCollectionComponent);
    objectCollectionComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should only show the grid component when the viewmode is set to grid', () => {
    objectCollectionComponent.currentMode$ = observableOf(ViewMode.GridElement);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('ds-object-grid'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('ds-themed-object-list'))).toBeNull();
  });

  it('should only show the list component when the viewmode is set to list', () => {
    objectCollectionComponent.currentMode$ = observableOf(ViewMode.ListElement);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('ds-themed-object-list'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('ds-object-grid'))).toBeNull();
  });

  it('should set fallback placeholder font size during test', async () => {
    objectCollectionComponent.currentMode$ = observableOf(ViewMode.ListElement);
    fixture.detectChanges();

    const comp = fixture.debugElement.query(By.css('ds-themed-object-list'));
    expect(comp).not.toBeNull();
    expect(comp.nativeElement.classList).not.toContain('hide-placeholder-text');
  });
});
