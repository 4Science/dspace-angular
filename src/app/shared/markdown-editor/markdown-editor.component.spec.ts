import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { By, DomSanitizer } from '@angular/platform-browser';

import { MarkdownEditorComponent } from './markdown-editor.component';

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MarkdownEditorComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        DomSanitizer,
        ChangeDetectorRef,
        {provide: PLATFORM_ID, useValue: 'browser'},
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

});
