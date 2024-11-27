import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NuMarkdownModule } from '@ng-util/markdown';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  standalone: true,
  imports: [
    NuMarkdownModule,
    FormsModule,
  ],
})
export class MarkdownEditorComponent implements OnInit {
  // to allow multiple textarea on the same screen, need to set an uniqueId for the textarea
  controlId: string;
  /**
   * Markdown Editor String value
   */
  @Input() editValue: string;

  /**
   * Indicates whether the markdown editor is required.
   */
  @Input() required: boolean;

  /**
   * Markdown Editor String value Emitter
   */
  @Output() editValueChange = new EventEmitter();
  /**
   * Nu markdown library options (default is chinese)
   */
  options = {
    minHeight: 200,
    lang: 'en_US',
    mode: 'ir',
    preview: {
      markdown: {
        codeBlockPreview: false,
      },
      actions: [
        'desktop', 'tablet', 'mobile',
      ],
    },
    toolbar: [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', 'table', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'undo', 'redo', '|',
      'fullscreen', 'preview',
    ],
  };

  ngOnInit(): void {
    this.controlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;
  }

}
