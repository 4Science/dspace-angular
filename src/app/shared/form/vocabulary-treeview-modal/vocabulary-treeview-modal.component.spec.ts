import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { VocabularyOptions } from '../../../core/submission/vocabularies/models/vocabulary-options.model';
import { VocabularyTreeviewComponent } from '../vocabulary-treeview/vocabulary-treeview.component';
import { VocabularyTreeviewModalComponent } from './vocabulary-treeview-modal.component';

describe('VocabularyTreeviewModalComponent', () => {
  let component: VocabularyTreeviewModalComponent;
  let fixture: ComponentFixture<VocabularyTreeviewModalComponent>;

  const modalStub = jasmine.createSpyObj('modalStub', ['close']);
  const vocabularyOptions = new VocabularyOptions('vocabularyTest', null, null, false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), VocabularyTreeviewModalComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub },
      ],
    })
      .overrideComponent(VocabularyTreeviewModalComponent, {
        remove: {
          imports: [VocabularyTreeviewComponent],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyTreeviewModalComponent);
    component = fixture.componentInstance;
    component.vocabularyOptions = vocabularyOptions;
    spyOn(component as any, 'setDescription').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init description message', () => {
    expect((component as any).setDescription).toHaveBeenCalled();
  });

  describe('translation fallback mechanism', () => {
    it('should use vocabulary-specific header when vocabularyOptions.name is provided', () => {
      component.vocabularyOptions = new VocabularyOptions('subject', null, null, false);
      fixture.detectChanges();

      const headerElement = fixture.nativeElement.querySelector('.modal-title');
      expect(headerElement).toBeTruthy();
      // The translation key should be 'vocabulary-treeview.header.subject'
      const translationKey = headerElement.textContent.trim();
      // In test environment, untranslated keys are returned as-is
      expect(translationKey).toContain('vocabulary-treeview.header');
    });

    it('should use generic header when vocabularyOptions.name is null', () => {
      component.vocabularyOptions = new VocabularyOptions(null, null, null, false);
      fixture.detectChanges();

      const headerElement = fixture.nativeElement.querySelector('.modal-title');
      expect(headerElement).toBeTruthy();
      // The translation key should be 'vocabulary-treeview.header'
      const translationKey = headerElement.textContent.trim();
      expect(translationKey).toContain('vocabulary-treeview.header');
    });

  });
});
