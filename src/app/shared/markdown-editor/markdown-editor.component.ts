import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ContentChange, QuillModules } from 'ngx-quill';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NuMarkdownComponent,
  ],
})
export class MarkdownEditorComponent implements OnInit {
  // to allow multiple textarea on the same screen, need to set an uniqueId for the textarea
  controlId: string;
  /**
   * Markdown Editor String value
   */
  @Input() editValue = '';

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
    toolbar: [
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
    ],
    syntax: false
  };

  /**
   * Emit content update after editing
   * @param content
   */
  updateContent(content: ContentChange) {
    this.editValueChange.emit(content.html);
  }
}
