import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule
  ],
  exports: [ MarkdownEditorComponent ],
  declarations: [ MarkdownEditorComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MarkdownEditorModule {}
