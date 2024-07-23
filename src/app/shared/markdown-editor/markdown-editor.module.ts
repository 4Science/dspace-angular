import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NuMarkdownModule } from '@ng-util/markdown';

import { MarkdownEditorComponent } from './markdown-editor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NuMarkdownModule,
  ],
  exports: [ MarkdownEditorComponent ],
  declarations: [ MarkdownEditorComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class MarkdownEditorModule {}
