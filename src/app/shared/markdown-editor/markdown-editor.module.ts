import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NuMarkdownModule } from '@ng-util/markdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NuMarkdownModule
  ],
  exports: [ MarkdownEditorComponent ],
  declarations: [ MarkdownEditorComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MarkdownEditorModule {}
