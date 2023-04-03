import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownEditorModule } from '../../../../../../shared/markdown-editor/markdown-editor.module';
import { DsDynamicMarkdownComponent } from './dynamic-markdown.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownEditorModule,
  ],
  exports: [ DsDynamicMarkdownComponent, MarkdownEditorModule ],
  declarations: [ DsDynamicMarkdownComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MarkdownModule {}
