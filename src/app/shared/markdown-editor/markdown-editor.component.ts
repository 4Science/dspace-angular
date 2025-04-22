import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  SecurityContext
} from '@angular/core';
import { ContentChange, QuillModules } from 'ngx-quill';
import { DomSanitizer } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements AfterViewInit {
  /**
   * Markdown Editor String value
   */
  @Input() editValue = '';
  /**
   * Whether the field is required
   */
  @Input() required: boolean;
  /**
   * Markdown Editor String value Emitter
   */
  @Output() editValueChange = new EventEmitter();

  /**
   * Quill modules config
   */
  modules: QuillModules = {
    'emoji-toolbar': true,
    toolbar: {
      container:  [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['emoji'],
      ],
    },
    syntax: false
  };

  modulesLoaded = false;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const quillImport = await import('quill');
        const quill = quillImport.default || quillImport;

        if (!quill || typeof quill.register !== 'function') {
          console.error('Quill not loaded correctly:', quill);
          return;
        }
        // Wait for the quill-emoji module
        await import('quill-emoji');

        this.modulesLoaded = true;
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error during Quill initialization:', error);
      }
    }
  }


  /**
   * Emit content update after editing
   * @param content
   */
  updateContent(content: ContentChange) {
    const sanitizedContent = this.sanitizer.sanitize(SecurityContext.HTML, content.html);
    this.editValueChange.emit(sanitizedContent);
  }
}
