import { Component } from '@angular/core';

import { MarkdownViewerComponent } from '../../../../../../../shared/markdown-viewer/markdown-viewer.component';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the markdown metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-markdown]',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
  imports: [
    MarkdownViewerComponent,
  ],
  standalone: true,
})
export class MarkdownComponent extends RenderingTypeValueModelComponent {

  /**
   * Id for truncable component
   */
  truncableId: string;

  ngOnInit(): void {
    this.truncableId = `${this.item.id}_${this.field.metadata}`;
  }
}
