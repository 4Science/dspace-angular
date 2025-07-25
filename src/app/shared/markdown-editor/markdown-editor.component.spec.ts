import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  By,
  DomSanitizer,
} from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { MarkdownEditorComponent } from './markdown-editor.component';

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        MarkdownEditorComponent,
      ],
      providers: [DomSanitizer],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when component loaded', () => {

    it('should display markdown editor', () => {
      component.modulesLoaded = true;
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css('.markdown-editor'));
      expect(element).not.toBeNull();
    });

  });

  describe('editValue setter', () => {
    it('should set _editValue when value is provided and _editValue is empty', () => {
      component.editValue = 'Initial Value';
      expect(component.editValue).toBe('Initial Value');
    });

    it('should not overwrite _editValue if it is already set', () => {
      component.editValue = 'Existing Value';
      component.editValue = 'New Value';
      expect(component.editValue).toBe('Existing Value');
    });

    it('should handle null value gracefully', () => {
      component.editValue = null;
      expect(component.editValue).toBe('');
    });

    it('should handle empty string value gracefully', () => {
      component.editValue = '';
      expect(component.editValue).toBe('');
    });
  });

});
