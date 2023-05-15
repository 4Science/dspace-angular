import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicNGBootstrapInputComponent } from '@ng-dynamic-forms/ui-ng-bootstrap';
import { DynamicFormLayoutService, DynamicFormValidationService } from '@ng-dynamic-forms/core';
import { DynamicMarkdownModel } from './dynamic-markdown.model';

@Component({
  selector: 'ds-dynamic-markdown',
  styleUrls: ['./dynamic-markdown.component.scss'],
  templateUrl: './dynamic-markdown.component.html',
})
/**
 * Component displaying a markdown usable in dynamic forms
 * Extends from bootstrap's input component but displays a markdown instead
 */
export class DsDynamicMarkdownComponent extends DynamicNGBootstrapInputComponent {
  /**
   * Use the model's ID for the input element
   */
  @Input() bindId = true;

  /**
   * The formgroup containing this component
   */
  @Input() group: FormGroup;

  /**
   * The model used for displaying the markdown
   */
  @Input() model: DynamicMarkdownModel;

  /**
   * Emit an event when the input is selected
   */
  @Output() selected = new EventEmitter<number>();

  /**
   * Emit an event when the input value is removed
   */
  @Output() remove = new EventEmitter<number>();

  /**
   * Emit an event when the input is blurred out
   */
  @Output() blur = new EventEmitter<any>();

  /**
   * Emit an event when the input value changes
   */
  @Output() change = new EventEmitter<any>();

  /**
   * Emit an event when the input is focused
   */
  @Output() focus = new EventEmitter<any>();

  /**
   * The value used to store old markdown value
   */
  oldModelValue = null;

  constructor(layoutService: DynamicFormLayoutService, validationService: DynamicFormValidationService) {
    super(layoutService, validationService);
  }

  ngDoCheck() {
    if (this.model && (this.model.value !== this.oldModelValue)) {
      this.change.emit(this.model.value);
      this.oldModelValue = this.model.value;
    }
  }

}
