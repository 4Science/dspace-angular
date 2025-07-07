import 'quill-emoji/dist/quill-emoji.js';
import { Component, EventEmitter, Input, Output, SecurityContext } from '@angular/core';
import { ContentChange, QuillModules } from 'ngx-quill';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
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
    'emoji-toolbar': true,
    toolbar: {
      container: [
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

  constructor(private sanitizer: DomSanitizer) {}


  /**
   * Emit content update after editing
   * @param content
   */
  updateContent(content: ContentChange) {
    const sanitizedContent = this.sanitizer.sanitize(SecurityContext.HTML, content.html);
    const normalizedContent = sanitizedContent?.replace(/&#160;/g, ' ');
    this.editValueChange.emit(normalizedContent);
}
}
