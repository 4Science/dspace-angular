import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
  NgbModal,
  NgbModalRef,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormControlComponent,
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import {
  combineLatest,
  Observable,
  of as observableOf,
  Subscription,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  scan,
  startWith,
  take,
} from 'rxjs/operators';

import { environment } from '../../../../../../../environments/environment';
import { SubmissionFormsModel } from '../../../../../../core/config/models/config-submission-forms.model';
import { Metadata } from '../../../../../../core/shared/metadata.utils';
import { getFirstSucceededRemoteDataPayload } from '../../../../../../core/shared/operators';
import { MetadataSecurityConfiguration } from '../../../../../../core/submission/models/metadata-security-configuration';
import { VocabularyEntryDetail } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { SubmissionService } from '../../../../../../submission/submission.service';
import { shrinkInOut } from '../../../../../animations/shrink';
import { BtnDisabledDirective } from '../../../../../btn-disabled.directive';
import {
  hasValue,
  isEmpty,
} from '../../../../../empty.util';
import { ThemedLoadingComponent } from '../../../../../loading/themed-loading.component';
import { ChipsComponent } from '../../../../chips/chips.component';
import { Chips } from '../../../../chips/models/chips.model';
import { ChipsItem } from '../../../../chips/models/chips-item.model';
import { FormComponent } from '../../../../form.component';
import { FormService } from '../../../../form.service';
import { FormBuilderService } from '../../../form-builder.service';
import { FormFieldMetadataValueObject } from '../../../models/form-field-metadata-value.model';
import { DynamicRelationGroupModel } from './dynamic-relation-group.model';
import { DsDynamicRelationGroupModalComponent } from './modal/dynamic-relation-group-modal.components';

/**
 * Component representing a group input field
 */
@Component({
  selector: 'ds-dynamic-relation-group',
  styleUrls: ['./dynamic-relation-group.component.scss'],
  templateUrl: './dynamic-relation-group.component.html',
  animations: [shrinkInOut],
  imports: [
    NgIf,
    AsyncPipe,
    NgbTooltipModule,
    TranslateModule,
    NgClass,
    ThemedLoadingComponent,
    ChipsComponent,
    forwardRef(() => FormComponent),
    BtnDisabledDirective,
  ],
  standalone: true,
})
export class DsDynamicRelationGroupComponent extends DynamicFormControlComponent implements OnDestroy, OnInit {

  @Input() formId: string;
  @Input() group: UntypedFormGroup;
  @Input() model: DynamicRelationGroupModel;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();

  public chips: Chips;
  public selectedChipItem: ChipsItem;

  protected selectedChipItemIndex: number;

  private subs: Subscription[] = [];
  private valueChangeSubscription: Subscription;

  constructor(private vocabularyService: VocabularyService,
              private formBuilderService: FormBuilderService,
              private formService: FormService,
              private cdr: ChangeDetectorRef,
              protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService,
              protected modalService: NgbModal,
              protected submissionService: SubmissionService,
  ) {
    super(layoutService, validationService);
  }

  ngOnInit() {
    this.valueChangeSubscription = this.model.valueChanges.pipe(
      startWith([]),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
    ).subscribe(() => {
      this.initChipsFromModelValue();
    });
  }

  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
    if (hasValue(this.valueChangeSubscription)) {
      this.valueChangeSubscription.unsubscribe();
    }
  }

  onBlur(event) {
    this.blur.emit();
  }

  onChipSelected(index): NgbModalRef {
    this.selectedChipItem = this.chips.getChipByIndex(index);
    this.selectedChipItemIndex = index;
    return this.openModal();
  }

  onFocus(event) {
    this.focus.emit(event);
  }

  openModal(): NgbModalRef {
    const modalRef = this.modalService.open(DsDynamicRelationGroupModalComponent, {
      size: 'lg',
    });
    this.submissionService.getSubmissionSecurityConfiguration(this.model.submissionId).pipe(
      take(1)).subscribe((res: MetadataSecurityConfiguration) => {
      modalRef.componentInstance.metadataSecurityConfiguration = res;
    });
    modalRef.componentInstance.group = this.group;
    modalRef.componentInstance.model = this.model;

    modalRef.componentInstance.editMode = !!this.selectedChipItem;
    modalRef.componentInstance.itemIndex = this.selectedChipItemIndex;
    modalRef.componentInstance.item = this.selectedChipItem?.item;
    modalRef.componentInstance.changedSecurity = false;
    modalRef.componentInstance.edit.pipe(take(1)).subscribe((item) => {
      this.chips.triggerUpdate = modalRef.componentInstance.changedSecurity;
      this.chips.update(this.selectedChipItem.id, item);
    });
    modalRef.componentInstance.add.pipe(take(1)).subscribe((item) => {
      this.chips.add(item);
    });
    if (hasValue(this.valueChangeSubscription)) {
      this.valueChangeSubscription.unsubscribe();
    }
    modalRef.result.then(() => {
      // close
      this.handleModalResult();
    }, () => {
      // dismiss
      this.handleModalResult();
    });

    return modalRef;
  }

  private handleModalResult(): void {
    this.selectedChipItemIndex = null;
    this.selectedChipItem = null;
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
    this.valueChangeSubscription = this.model.valueChanges.pipe(
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
    ).subscribe(() => {
      this.initChipsFromModelValue();
    });
  }

  private initChipsFromModelValue() {
    let initChipsValue$: Observable<any[]>;
    if (this.model.isEmpty()) {
      this.initChips([]);
    } else {
      initChipsValue$ = observableOf(this.model.getGroupValue() as any[]);
      // If authority
      this.subs.push(initChipsValue$.pipe(
        mergeMap((valueModel) => {
          const returnList: Observable<any>[] = [];
          valueModel.forEach((valueObj) => {

            const returnObj = Object.keys(valueObj).map((fieldName) => {
              let return$: Observable<any>;
              if (isObject(valueObj[fieldName]) && this.hasValidAuthority(valueObj[fieldName]) && valueObj[fieldName].otherInformation === null) {
                return$ = this.getVocabulary(valueObj, fieldName);
              } else {
                return$ = observableOf(valueObj[fieldName]);
              }
              return return$.pipe(map((entry) => ({ [fieldName]: entry })));
            });

            returnList.push(combineLatest(returnObj));
          });
          return returnList;
        }),
        mergeMap((valueListObj: Observable<any>, index: number) => {
          return valueListObj.pipe(
            map((valueObj: any) => ({
              index: index, value: valueObj.reduce(
                (acc: any, value: any) => Object.assign({}, acc, value),
              ),
            }),
            ),
          );
        }),
        scan((acc: any[], valueObj: any) => {
          if (acc.length === 0) {
            acc.push(valueObj.value);
          } else {
            acc.splice(valueObj.index, 0, valueObj.value);
          }
          return acc;
        }, []),
        filter((modelValues: any[]) => this.model.getGroupValue().length === modelValues.length),
      ).pipe(distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b))).subscribe((modelValue) => {
        this.model.value = modelValue;
        this.initChips(modelValue);
        this.cdr.markForCheck();
      }));
    }
  }

  private initChips(initChipsValue) {
    this.chips = new Chips(
      initChipsValue,
      'value',
      this.model.mandatoryField,
      environment.submission.icons.metadata);
    this.subs.push(
      this.chips.chipsItems
        .subscribe(() => {
          const items = this.chips.getChipsItems();
          // Does not emit change if model value is equal to the current value
          if (!isEqual(items, this.model.value)) {
            if (!(isEmpty(items) && this.model.isEmpty())) {
              this.model.value = items;
              this.change.emit();
            }
          } else {
            if (this.chips.triggerUpdate) {
              this.change.emit();
              this.chips.triggerUpdate = false;
            }
          }
        }),
    );
  }

  private getVocabulary(valueObj, fieldName): Observable<any> {
    const config = { rows: this.model.formConfiguration } as SubmissionFormsModel;
    const formModel = this.formBuilderService.modelFromConfiguration(
      this.model.submissionId,
      config,
      this.model.scopeUUID,
      {}, // @Input model.value
      this.model.submissionScope,
      this.model.readOnly,
      null,
      true);
    const fieldId = fieldName.replace(/\./g, '_');
    const model = this.formBuilderService.findById(fieldId, formModel);
    if ((model as any)?.vocabularyOptions?.name) {
      return this.vocabularyService.findEntryDetailById(
        valueObj[fieldName].authority,
        (model as any).vocabularyOptions.name,
      ).pipe(
        getFirstSucceededRemoteDataPayload(),
        map((entryDetail: VocabularyEntryDetail) => Object.assign(
          new FormFieldMetadataValueObject(),
          valueObj[fieldName],
          {
            otherInformation: entryDetail.otherInformation,
          }),
        ));
    } else {
      return observableOf(valueObj[fieldName]);
    }
  }

  private hasValidAuthority(formMetadataValue: FormFieldMetadataValueObject) {
    return Metadata.hasValidAuthority(formMetadataValue?.authority);
  }
}
