import {
  CdkDrag,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  Observable,
  Subscription,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { EditMetadataSecurityComponent } from 'src/app/item-page/edit-item-page/edit-metadata-security/edit-metadata-security.component';

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { RelationshipDataService } from '../../../core/data/relationship-data.service';
import { MetadataService } from '../../../core/metadata/metadata.service';
import { ConfidenceType } from '../../../core/shared/confidence-type';
import { Context } from '../../../core/shared/context.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { ItemMetadataRepresentation } from '../../../core/shared/metadata-representation/item/item-metadata-representation.model';
import {
  MetadataRepresentation,
  MetadataRepresentationType,
} from '../../../core/shared/metadata-representation/metadata-representation.model';
import { MetadataSecurityConfiguration } from '../../../core/submission/models/metadata-security-configuration';
import { Vocabulary } from '../../../core/submission/vocabularies/models/vocabulary.model';
import { getItemPageRoute } from '../../../item-page/item-page-routing-paths';
import { BtnDisabledDirective } from '../../../shared/btn-disabled.directive';
import { hasValue } from '../../../shared/empty.util';
import { AuthorityConfidenceStateDirective } from '../../../shared/form/directives/authority-confidence-state.directive';
import { ThemedTypeBadgeComponent } from '../../../shared/object-collection/shared/badges/type-badge/themed-type-badge.component';
import { DebounceDirective } from '../../../shared/utils/debounce.directive';
import {
  DsoEditMetadataChangeType,
  DsoEditMetadataValue,
} from '../dso-edit-metadata-form';
import { DsoEditMetadataFieldService } from '../dso-edit-metadata-value-field/dso-edit-metadata-field.service';
import { EditMetadataValueFieldType } from '../dso-edit-metadata-value-field/dso-edit-metadata-field-type.enum';
import { DsoEditMetadataValueFieldLoaderComponent } from '../dso-edit-metadata-value-field/dso-edit-metadata-value-field-loader/dso-edit-metadata-value-field-loader.component';

@Component({
  selector: 'ds-dso-edit-metadata-value',
  styleUrls: ['./dso-edit-metadata-value.component.scss', '../dso-edit-metadata-shared/dso-edit-metadata-cells.scss'],
  templateUrl: './dso-edit-metadata-value.component.html',
  imports: [
    AsyncPipe,
    AuthorityConfidenceStateDirective,
    BtnDisabledDirective,
    CdkDrag,
    CdkDragHandle,
    DebounceDirective,
    DsoEditMetadataValueFieldLoaderComponent,
    EditMetadataSecurityComponent,
    FormsModule,
    NgbTooltipModule,
    NgClass,
    RouterLink,
    ThemedTypeBadgeComponent,
    TranslateModule,
  ],
})
/**
 * Component displaying a single editable row for a metadata value
 */
export class DsoEditMetadataValueComponent implements OnInit, OnChanges, OnDestroy {

  @Input() context: Context;

  /**
   * The parent {@link DSpaceObject} to display a metadata form for
   * Also used to determine metadata-representations in case of virtual metadata
   */
  @Input() dso: DSpaceObject;

  /**
   * Editable metadata value to show
   */
  @Input() mdValue: DsoEditMetadataValue;

  /**
   * The metadata security configuration for the entity.
   */
  @Input()
  set metadataSecurityConfiguration(metadataSecurityConfiguration: MetadataSecurityConfiguration) {
    this._metadataSecurityConfiguration$.next(metadataSecurityConfiguration);
  }

  get metadataSecurityConfiguration() {
    return this._metadataSecurityConfiguration$.value;
  }

  protected readonly _metadataSecurityConfiguration$ =
    new BehaviorSubject<MetadataSecurityConfiguration | null>(null);

  /**
   * The metadata field to display a value for
   */
  @Input()
  set mdField(mdField: string) {
    this._mdField$.next(mdField);
  }

  get mdField() {
    return this._mdField$.value;
  }

  protected readonly _mdField$ = new BehaviorSubject<string | null>(null);

  /**
   * Flag whether this is a new metadata field or exists already
   */
  @Input() isNewMdField = false;

  /**
   * Type of DSO we're displaying values for
   * Determines i18n messages
   */
  @Input() dsoType: string;

  /**
   * Observable to check if the form is being saved or not
   * Will disable certain functionality while saving
   */
  @Input() saving$: Observable<boolean>;

  /**
   * Is this value the only one within its list?
   * Will disable certain functionality like dragging (because dragging within a list of 1 is pointless)
   */
  @Input() isOnlyValue = false;

  /**
   * Emits when the user clicked edit
   */
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Emits when the user clicked confirm
   */
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Emits when the user clicked remove
   */
  @Output() remove: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Emits when the user clicked undo
   */
  @Output() undo: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Emits true when the user starts dragging a value, false when the user stops dragging
   */
  @Output() dragging: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Emits the new value of security level
   */
  @Output() updateSecurityLevel: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Emits true when the metadata has security settings
   */
  @Output() hasSecurityLevel: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  /**
   * The DsoEditMetadataChangeType enumeration for access in the component's template
   * @type {DsoEditMetadataChangeType}
   */
  public DsoEditMetadataChangeTypeEnum = DsoEditMetadataChangeType;

  /**
   * The item this metadata value represents in case it's virtual (if any, otherwise null)
   */
  mdRepresentation$: Observable<ItemMetadataRepresentation | null>;

  /**
   * The route to the item represented by this virtual metadata value (otherwise null)
   */
  mdRepresentationItemRoute$: Observable<string | null>;

  /**
   * The name of the item represented by this virtual metadata value (otherwise null)
   */
  mdRepresentationName$: Observable<string | null>;

  readonly mdSecurityConfigLevel$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  canShowMetadataSecurity$: Observable<boolean>;

  private sub: Subscription;

  /**
   * The type of edit field that should be displayed
   */
  fieldType$: Observable<EditMetadataValueFieldType>;

  readonly ConfidenceTypeEnum = ConfidenceType;

  constructor(
    protected relationshipService: RelationshipDataService,
    protected dsoNameService: DSONameService,
    protected metadataService: MetadataService,
    protected dsoEditMetadataFieldService: DsoEditMetadataFieldService,
  ) {
  }

  ngOnInit(): void {
    this.initVirtualProperties();

    this.sub = combineLatest([
      this._mdField$,
      this._metadataSecurityConfiguration$,
    ]).subscribe(([mdField, metadataSecurityConfig]) => this.initSecurityLevel(mdField, metadataSecurityConfig));

    this.canShowMetadataSecurity$ =
        combineLatest([
          this._mdField$.pipe(distinctUntilChanged()),
          this.mdSecurityConfigLevel$,
        ]).pipe(
          map(([mdField, securityConfigLevel]) => hasValue(mdField) && this.hasSecurityChoice(securityConfigLevel)),
          shareReplay({ refCount: false, bufferSize: 1 }),
        );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mdField) {
      this.fieldType$ = this.getFieldType();
    }
  }

  /**
   * Emits the edit event
   * @param securityLevel
   */
  changeSelectedSecurity(securityLevel: number) {
    this.updateSecurityLevel.emit(securityLevel);
  }

  /**
   * Initialise potential properties of a virtual metadata value
   */
  initVirtualProperties(): void {
    this.mdRepresentation$ = this.metadataService.isVirtual(this.mdValue.newValue) ?
      this.relationshipService.resolveMetadataRepresentation(this.mdValue.newValue, this.dso, 'Item')
        .pipe(
          map((mdRepresentation: MetadataRepresentation) =>
            mdRepresentation.representationType === MetadataRepresentationType.Item ? mdRepresentation as ItemMetadataRepresentation : null,
          ),
        ) : EMPTY;
    this.mdRepresentationItemRoute$ = this.mdRepresentation$.pipe(
      map((mdRepresentation: ItemMetadataRepresentation) => mdRepresentation ? getItemPageRoute(mdRepresentation) : null),
    );
    this.mdRepresentationName$ = this.mdRepresentation$.pipe(
      map((mdRepresentation: ItemMetadataRepresentation) => mdRepresentation ? this.dsoNameService.getName(mdRepresentation) : null),
    );
  }

  /**
   * Retrieves the {@link EditMetadataValueFieldType} to be displayed for the current field while in edit mode.
   */
  getFieldType(): Observable<EditMetadataValueFieldType> {
    return this.dsoEditMetadataFieldService.findDsoFieldVocabulary(this.dso, this.mdField).pipe(
      map((vocabulary: Vocabulary) => {
        if (hasValue(vocabulary)) {
          return EditMetadataValueFieldType.AUTHORITY;
        }
        if (this.mdField === 'dspace.entity.type') {
          return EditMetadataValueFieldType.ENTITY_TYPE;
        }
        return EditMetadataValueFieldType.PLAIN_TEXT;
      }),
    );
  }

  initSecurityLevel(mdField: string, metadataSecurityConfig: MetadataSecurityConfiguration) {
    let appliedSecurity: number[] = [];
    if (hasValue(metadataSecurityConfig)) {
      if (metadataSecurityConfig?.metadataCustomSecurity[mdField]) {
        appliedSecurity = metadataSecurityConfig.metadataCustomSecurity[mdField];
      } else if (metadataSecurityConfig?.metadataSecurityDefault) {
        appliedSecurity = metadataSecurityConfig.metadataSecurityDefault;
      }
    }
    this.mdSecurityConfigLevel$.next(appliedSecurity);
  }

  /**
   * Emits the value for the metadata security existence
   */
  hasSecurityMetadata(event: boolean) {
    this.hasSecurityLevel.emit(event);
  }

  private hasSecurityChoice(securityConfigLevel: number[]) {
    return securityConfigLevel?.length > 1;
  }

  ngOnDestroy(): void {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }

}
