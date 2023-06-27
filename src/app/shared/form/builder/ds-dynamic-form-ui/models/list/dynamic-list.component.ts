import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  DynamicCheckboxModel,
  DynamicFormControlComponent,
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import findKey from 'lodash/findKey';

import { hasValue, isNotEmpty } from '../../../../../empty.util';
import { DynamicListCheckboxGroupModel } from './dynamic-list-checkbox-group.model';
import { FormBuilderService } from '../../../form-builder.service';
import { DynamicListRadioGroupModel } from './dynamic-list-radio-group.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { getFirstSucceededRemoteDataPayload } from '../../../../../../core/shared/operators';
import { PaginatedList } from '../../../../../../core/data/paginated-list.model';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { PageInfo } from '../../../../../../core/shared/page-info.model';

export interface ListItem {
  id: string;
  label: string;
  value: boolean;
  index: number;
}

/**
 * Component representing a list input field
 */
@Component({
  selector: 'ds-dynamic-list',
  styleUrls: ['./dynamic-list.component.scss'],
  templateUrl: './dynamic-list.component.html'
})
export class DsDynamicListComponent extends DynamicFormControlComponent implements OnInit, OnDestroy {

  @Input() group: FormGroup;
  @Input() model: any;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();

  public items: ListItem[][] = [];
  protected optionsList: VocabularyEntry[];

  /**
   * The selected option(s) in the list
   * @protected
   */
  protected currentListValue: any;

  /**
   * Subscription to model value changes
   * @protected
   */
  protected subscription: Subscription;

  public otherListEntry = '';

  public addButtonDisabled = false;

  public isNewEntryDuplicate = false;

  public existingEntry = '';

  constructor(private vocabularyService: VocabularyService,
              private cdr: ChangeDetectorRef,
              private formBuilderService: FormBuilderService,
              protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService
  ) {
    super(layoutService, validationService);
  }

  /**
   * Initialize the component, setting up the field options
   */
  ngOnInit() {
    if (this.model.vocabularyOptions && hasValue(this.model.vocabularyOptions.name)) {
      this.setOptionsFromVocabulary();
    }
    this.currentListValue = this.model.value;
    this.subscription = this.model.valueChanges.pipe(
      filter((value) => this.currentListValue !== value)
    ).subscribe(() => {
      this.setOptionsFromVocabulary();
    });
  }

  /**
   * Emits a blur event containing a given value.
   * @param event The value to emit.
   */
  onBlur(event: Event) {
    this.blur.emit(event);
  }

  /**
   * Emits a focus event containing a given value.
   * @param event The value to emit.
   */
  onFocus(event: Event) {
    this.focus.emit(event);
  }

  /**
   * Updates model value with the current value
   * @param event The change event.
   */
  onChange(event: Event) {
    const target = event.target as any;
    if (this.model.repeatable) {
      // Target tabindex coincide with the array index of the value into the authority list
      const entry: VocabularyEntry = this.optionsList[target.tabIndex];
      if (target.checked) {
        this.currentListValue = entry;
        this.model.valueChanges.next(entry);
      } else {
        const newValue = [];
        this.model.value
          .filter((item) => item.value !== entry.value)
          .forEach((item) => newValue.push(item));
        this.currentListValue = newValue;
        this.model.valueChanges.next(newValue);
      }
    } else {
      this.currentListValue = this.optionsList[target.value];
      (this.model as DynamicListRadioGroupModel).value = this.optionsList[target.value];
    }
    this.change.emit(event);
  }

  /**
   * Setting up the field options from vocabulary
   */
  protected setOptionsFromVocabulary() {
    if (this.model.vocabularyOptions.name && this.model.vocabularyOptions.name.length > 0) {
      const listGroup = this.group.controls[this.model.id] as FormGroup;
      const pageInfo: PageInfo = new PageInfo({
        elementsPerPage: 9999, currentPage: 1
      } as PageInfo);
      this.vocabularyService.getVocabularyEntries(this.model.vocabularyOptions, pageInfo).pipe(
        getFirstSucceededRemoteDataPayload()
      ).subscribe((entries: PaginatedList<VocabularyEntry>) => {
        this.optionsList = entries.page;
        // Make a list of available options (checkbox/radio) and split in groups of 'model.groupLength'
        this.listingAvailableOptions(listGroup, entries.page);
      });

    }
  }

  /**
   * Listing Available Options in List.
   */
  listingAvailableOptions(listGroup, entries) {
    let groupCounter = 0;
    let itemsPerGroup = 0;
    let tempList: ListItem[] = [];
    if (this.model.value) {
      if (this.model.repeatable) {
        this.model.value.forEach(element => {
          const checkData = entries.find(o => o.value === element.value);
          if (!checkData) {
            const object = this.createVocabularyObject(element.display, element.value, element.otherInformation);
            entries.push(object);
          }
        });
      } else {
        const checkData = entries.find(o => o.value === this.model.value.value);
        if (!checkData) {
          const object = this.createVocabularyObject(this.model.value.display, this.model.value.value, this.model.value.otherInformation);
          entries.push(object);
        }
      }
    }
    entries.forEach((option, key) => {
      const value = option.authority ?? option.value;
      let checked: boolean;
      if (this.model.repeatable) {
        checked = isNotEmpty(findKey(
        this.model.value,
        (v) => v.value === option.value));
      } else {
        checked = this.model.value && option.value === this.model.value.value;
      }

      const item: ListItem = {
        id: value,
        label: option.display,
        value: checked,
        index: key
      };
      if (this.model.repeatable) {
        this.formBuilderService.addFormGroupControl(listGroup, (this.model as DynamicListCheckboxGroupModel), new DynamicCheckboxModel(item));
      } else {
        (this.model as DynamicListRadioGroupModel).options.push({
          label: item.label,
          value: option
        });
      }
      tempList.push(item);
      itemsPerGroup++;
      this.items[groupCounter] = tempList;
      if (itemsPerGroup === this.model.groupLength) {
        groupCounter++;
        itemsPerGroup = 0;
        tempList = [];
      }
    });
    this.cdr.markForCheck();
    this.otherListEntry = '';
  }

  /**
   * Add the Item to List.
   */
  addListItem() {
    if (!!this.otherListEntry.toString()) {

      const matchingEntry = this.optionsList.find((element) =>
        (element.display.toLowerCase() === this.otherListEntry.toLowerCase()) ||
        (element.value?.toLowerCase() === this.otherListEntry.toLowerCase()) ||
        (this.otherListEntry.toLowerCase() === 'other')
      );

      this.isNewEntryDuplicate = !! matchingEntry;

      if (this.isNewEntryDuplicate) {
        const matchingEntryValue = matchingEntry.value ? ` [${matchingEntry.value}]` : '';
        this.existingEntry = matchingEntry.display + matchingEntryValue;
      } else {
        const otherOption = this.createVocabularyObject(this.otherListEntry, this.otherListEntry, undefined);
        this.optionsList.push(otherOption);
        const listGroup = this.group.controls[this.model.id] as FormGroup;
        // Make a list of available options (checkbox/radio) and split in groups of 'model.groupLength'
        this.listingAvailableOptions(listGroup, this.optionsList);
      }
    }
  }

  /**
   * Create a vocabulary object.
   */
  createVocabularyObject(display, value, otherInformation) {
    return Object.assign(new VocabularyEntry(), this.model.value, {
      display: display,
      value: value,
      otherInformation: otherInformation,
      type: 'vocabularyEntry'
    });
  }

  ngOnDestroy(): void {
    if (hasValue(this.subscription)) {
      this.subscription.unsubscribe();
    }
  }

}
