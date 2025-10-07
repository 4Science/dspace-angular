import {
  Component,
  EventEmitter,
  Input,
  Output,
  SecurityContext,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ContentChange,
  QuillEditorComponent,
  QuillModules,
} from 'ngx-quill';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    QuillEditorComponent,
  ],
})
export class MarkdownEditorComponent {
  /**
   * Markdown Editor String value
   */
  @Input() set editValue(value: string) {
    if (value && !this._editValue) {
      this._editValue = value;
    }
  }

  get editValue(): string {
    return this._editValue;
  }

  private _editValue = '';
  /**
   * Indicates whether the markdown editor is required.
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
    'toolbar': {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['emoji'],
      ],
    },
    syntax: false,
  };

  constructor(private sanitizer: DomSanitizer) {}


  /**
   * Emit content update after editing
   * @param content
   */
  updateContent(content: ContentChange) {
    const sanitizedContent = this.sanitizer.sanitize(SecurityContext.HTML, content.html);
    let normalizedContent = sanitizedContent?.replace(/&#160;/g, ' ');
    // Remove outer <p>...</p> if present as quill wraps around p by default
    if (normalizedContent) {
      normalizedContent = normalizedContent.replace(/^<p>([\s\S]*)<\/p>$/i, '$1');
    }
    this.editValueChange.emit(normalizedContent);
  }
}
