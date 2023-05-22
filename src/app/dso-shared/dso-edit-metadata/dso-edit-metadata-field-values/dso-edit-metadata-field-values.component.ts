import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DsoEditMetadataChangeType, DsoEditMetadataForm, DsoEditMetadataValue } from '../dso-edit-metadata-form';
import { Observable } from 'rxjs/internal/Observable';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { map, take } from 'rxjs';
import { MetadataSecurityConfiguration } from '../../../core/submission/models/metadata-security-configuration';

@Component({
  selector: 'ds-dso-edit-metadata-field-values',
  styleUrls: ['./dso-edit-metadata-field-values.component.scss'],
  templateUrl: './dso-edit-metadata-field-values.component.html',
})
/**
 * Component displaying table rows for each value for a certain metadata field within a form
 */
export class DsoEditMetadataFieldValuesComponent {
  /**
   * The parent {@link DSpaceObject} to display a metadata form for
   * Also used to determine metadata-representations in case of virtual metadata
   */
  @Input() dso: DSpaceObject;
  /**
   * A dynamic form object containing all information about the metadata and the changes made to them, see {@link DsoEditMetadataForm}
   */
  @Input() form: DsoEditMetadataForm;

  /**
   * Metadata field to display values for
   */
  @Input() mdField: string;

  /**
   * Type of DSO we're displaying values for
   * Determines i18n messages
   */
  @Input() dsoType: string;

  /**
   * Observable to check if the form is being saved or not
   */
  @Input() saving$: Observable<boolean>;

  /**
   * Tracks for which metadata-field a drag operation is taking place
   * Null when no drag is currently happening for any field
   */
  @Input() draggingMdField$: BehaviorSubject<string>;

  /**
   * Security Settings configuration for the current entity
   */
  @Input() metadataSecurityConfiguration: Observable<MetadataSecurityConfiguration>;
  /**
   * Emit when the value has been saved within the form
   */
  @Output() valueSaved: EventEmitter<any> = new EventEmitter<any>();

  /**
   * The DsoEditMetadataChangeType enumeration for access in the component's template
   * @type {DsoEditMetadataChangeType}
   */
  public DsoEditMetadataChangeTypeEnum = DsoEditMetadataChangeType;

  /**
   * Drop a value into a new position
   * Update the form's value array for the current field to match the dropped position
   * Update the values their place property to match the new order
   * Send an update to the parent
   * @param event
   */
  drop(event: CdkDragDrop<any>) {
    const dragIndex = event.previousIndex;
    const dropIndex = event.currentIndex;
    // Move the value within its field
    moveItemInArray(this.form.fields[this.mdField], dragIndex, dropIndex);
    // Update all the values in this field their place property
    this.form.fields[this.mdField].forEach((value: DsoEditMetadataValue, index: number) => {
      value.newValue.place = index;
      value.confirmChanges();
    });
    // Update the form statuses
    this.form.resetReinstatable();
    this.valueSaved.emit();
  }

  /**
   * Get the custom security metadata for the current field
   */
  getCustomSecurityMetadata(): Observable<number[]> {
    if (this.metadataSecurityConfiguration) {
      return this.metadataSecurityConfiguration.pipe(
        take(1),
        map((value: MetadataSecurityConfiguration) => {
          if (value.metadataCustomSecurity[this.mdField]) {
            return value.metadataCustomSecurity[this.mdField];
          }
        })
      );
    }
  }

  /**
   * Get the default security metadata for the current field
   */
  getDefaultSecurityMetadata(): Observable<number> {
    if (this.metadataSecurityConfiguration) {
      return this.metadataSecurityConfiguration.pipe(
        map((value: MetadataSecurityConfiguration) => {
          if (value.metadataCustomSecurity[this.mdField]) {
            return value.metadataSecurityDefault[0] ?? 0;
          }
        })
      );
    }
  }

  /**
   * Update the security level for the field at the given index
   */
  onUpdateSecurityLevelValue(securityLevel: number, index: number) {
    if (this.form.fields[this.mdField]?.length > 0) {
      this.form.fields[this.mdField][index].change = DsoEditMetadataChangeType.UPDATE;
      this.form.fields[this.mdField][index].newValue.securityLevel = securityLevel;

      this.valueSaved.emit();
    }
  }
}
