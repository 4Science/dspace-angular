import {
  Component,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { createTestComponent } from '@dspace/core';
import { CollectionListEntry } from '../../../shared/collection-dropdown/collection-dropdown.component';
import { ThemedCollectionDropdownComponent } from '../../../shared/collection-dropdown/themed-collection-dropdown.component';
import { ThemedLoadingComponent } from '../../../shared/loading/themed-loading.component';
import { getMockThemeService } from '../../../shared/mocks/theme-service.mock';
import { ThemeService } from '../../../shared/theme-support/theme.service';
import { SubmissionImportExternalCollectionComponent } from './submission-import-external-collection.component';

describe('SubmissionImportExternalCollectionComponent test suite', () => {
  let comp: SubmissionImportExternalCollectionComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<SubmissionImportExternalCollectionComponent>;
  let themeService = getMockThemeService();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SubmissionImportExternalCollectionComponent,
        TestComponent,
      ],
      providers: [
        NgbActiveModal,
        SubmissionImportExternalCollectionComponent,
        { provide: ThemeService, useValue: themeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubmissionImportExternalCollectionComponent, {
        remove: {
          imports: [
            ThemedLoadingComponent,
            ThemedCollectionDropdownComponent,
          ],
        },
      })
      .compileComponents().then();
  }));

  // First test to check the correct component creation
  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-submission-import-external-collection></ds-submission-import-external-collection>`;
      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create SubmissionImportExternalCollectionComponent', inject([SubmissionImportExternalCollectionComponent], (app: SubmissionImportExternalCollectionComponent) => {
      expect(app).toBeDefined();
    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SubmissionImportExternalCollectionComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
    });

    afterEach(() => {
      fixture.destroy();
      comp = null;
      compAsAny = null;
    });

    it('should emit from selectedEvent on selectObject and set loading to true', () => {
      spyOn(comp.selectedEvent, 'emit').and.callThrough();

      const entry = {
        communities: [
          { id: 'community1' },
          { id: 'community2' },
        ],
        collection: {
          id: 'collection',
        },
      } as CollectionListEntry;
      comp.selectObject(entry);

      expect(comp.selectedEvent.emit).toHaveBeenCalledWith(entry);
      expect(comp.loading).toBeTrue();
    });

    it('should dismiss modal on closeCollectionModal', () => {
      spyOn(compAsAny.activeModal, 'dismiss');
      comp.closeCollectionModal();

      expect(compAsAny.activeModal.dismiss).toHaveBeenCalled();
    });

    it('should be in loading state when search is not completed', () => {
      comp.loading = null;
      expect(comp.isLoading()).toBeFalse();

      comp.loading = true;
      expect(comp.isLoading()).toBeTrue();

      comp.loading = false;
      expect(comp.isLoading()).toBeFalse();
    });

    it('should set loading variable to false on searchComplete event', () => {
      comp.loading = null;

      comp.searchComplete();
      expect(comp.loading).toBe(false);

    });

    it('should emit theOnlySelectable', () => {
      spyOn(comp.selectedEvent, 'emit').and.callThrough();

      const selected: any = {};
      comp.theOnlySelectable(selected);

      expect(comp.selectedEvent.emit).toHaveBeenCalledWith(selected);
    });

    it('dropdown should be invisible when the component is loading', waitForAsync(() => {

      spyOn(comp, 'isLoading').and.returnValue(true);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const dropdownMenu = fixture.debugElement.query(By.css('ds-collection-dropdown')).nativeElement;
        expect(dropdownMenu.classList).toContain('d-none');
      });
    }));

  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
})
class TestComponent {

}
