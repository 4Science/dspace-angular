import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  Data,
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  combineLatest as observableCombineLatest,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';

import {
  APP_DATA_SERVICES_MAP,
  LazyDataServicesMap,
} from '../../../config/app-config.interface';
import { DATA_SERVICE_FACTORY } from '../../core/cache/builders/build-decorators';
import { ArrayMoveChangeAnalyzer } from '../../core/data/array-move-change-analyzer.service';
import { HALDataService } from '../../core/data/base/hal-data-service.interface';
import { RemoteData } from '../../core/data/remote-data';
import { UpdateDataService } from '../../core/data/update-data.service';
import { lazyDataService } from '../../core/lazy-data-service';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { GenericConstructor } from '../../core/shared/generic-constructor';
import { Item } from '../../core/shared/item.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { ResourceType } from '../../core/shared/resource-type';
import { MetadataSecurityConfigurationService } from '../../core/submission/metadatasecurityconfig-data.service';
import { MetadataSecurityConfiguration } from '../../core/submission/models/metadata-security-configuration';
import { AlertComponent } from '../../shared/alert/alert.component';
import { AlertType } from '../../shared/alert/alert-type';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import {
  hasNoValue,
  hasValue,
  isNotEmpty,
} from '../../shared/empty.util';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { DsoEditMetadataFieldValuesComponent } from './dso-edit-metadata-field-values/dso-edit-metadata-field-values.component';
import {
  DsoEditMetadataChangeType,
  DsoEditMetadataForm,
} from './dso-edit-metadata-form';
import { DsoEditMetadataHeadersComponent } from './dso-edit-metadata-headers/dso-edit-metadata-headers.component';
import { DsoEditMetadataValueComponent } from './dso-edit-metadata-value/dso-edit-metadata-value.component';
import { DsoEditMetadataValueHeadersComponent } from './dso-edit-metadata-value-headers/dso-edit-metadata-value-headers.component';
import { MetadataFieldSelectorComponent } from './metadata-field-selector/metadata-field-selector.component';

@Component({
  selector: 'ds-base-dso-edit-metadata',
  styleUrls: ['./dso-edit-metadata.component.scss'],
  templateUrl: './dso-edit-metadata.component.html',
  standalone: true,
  imports: [NgIf, DsoEditMetadataHeadersComponent, MetadataFieldSelectorComponent, DsoEditMetadataValueHeadersComponent, DsoEditMetadataValueComponent, NgFor, DsoEditMetadataFieldValuesComponent, AlertComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule, BtnDisabledDirective],
})
/**
 * Component showing a table of all metadata on a DSpaceObject and options to modify them
 */
export class DsoEditMetadataComponent implements OnInit, OnDestroy {
  /**
   * DSpaceObject to edit metadata for
   */
  @Input() dso: DSpaceObject;

  /**
   * Reference to the component responsible for showing a metadata-field selector
   * Used to validate its contents (existing metadata field) before adding a new metadata value
   */
  @ViewChild(MetadataFieldSelectorComponent) metadataFieldSelectorComponent: MetadataFieldSelectorComponent;

  /**
   * Resolved update data-service for the given DSpaceObject (depending on its type, e.g. ItemDataService for an Item)
   * Used to send the PATCH request
   */
  @Input() updateDataService: UpdateDataService<DSpaceObject>;

  /**
   * Type of the DSpaceObject in String
   * Used to resolve i18n messages
   */
  dsoType: string;

  /**
   * A dynamic form object containing all information about the metadata and the changes made to them, see {@link DsoEditMetadataForm}
   */
  form: DsoEditMetadataForm;

  /**
   * The metadata field entered by the user for a new metadata value
   */
  newMdField: string;

  // Properties determined by the state of the dynamic form, updated by onValueSaved()
  isReinstatable: boolean;
  hasChanges: boolean;
  isEmpty: boolean;

  /**
   * Whether or not the form is currently being submitted
   */
  saving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Tracks for which metadata-field a drag operation is taking place
   * Null when no drag is currently happening for any field
   * This is a BehaviorSubject that is passed down to child components, to give them the power to alter the state
   */
  draggingMdField$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  /**
   * Whether or not the metadata field is currently being validated
   */
  loadingFieldValidation$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Combination of saving$ and loadingFieldValidation$
   * Emits true when any of the two emit true
   */
  savingOrLoadingFieldValidation$: Observable<boolean>;

  /**
   * The AlertType enumeration for access in the component's template
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * Subscription for updating the current DSpaceObject
   * Unsubscribed from in ngOnDestroy()
   */
  dsoUpdateSubscription: Subscription;

  /**
   * Field to keep track of the current security level
   * in case a new mdField is added and the security level needs to be set
   */
  newMdFieldWithSecurityLevelValue: number;

  /**
   * Flag to indicate if the metadata security configuration is present
   * for the newly added metadata field
   */
  hasSecurityMetadata = false;

  /**
   * Contains metadata security configuration object
   */
  isFormInitialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Contains metadata security configuration object
   */
  securitySettings$: BehaviorSubject<MetadataSecurityConfiguration> = new BehaviorSubject(null);

  constructor(protected route: ActivatedRoute,
              protected notificationsService: NotificationsService,
              protected translateService: TranslateService,
              protected parentInjector: Injector,
              protected arrayMoveChangeAnalyser: ArrayMoveChangeAnalyzer<number>,
              protected cdr: ChangeDetectorRef,
              @Inject(APP_DATA_SERVICES_MAP) private dataServiceMap: LazyDataServicesMap,
              protected metadataSecurityConfigurationService: MetadataSecurityConfigurationService,
              @Inject(DATA_SERVICE_FACTORY) protected getDataServiceFor: (resourceType: ResourceType) => GenericConstructor<HALDataService<any>>) {
  }

  /**
   * Read the route (or parent route)'s data to retrieve the current DSpaceObject
   * After it's retrieved, initialise the data-service and form
   */
  ngOnInit(): void {
    if (hasNoValue(this.dso)) {
      this.dsoUpdateSubscription = observableCombineLatest([this.route.data, this.route.parent.data]).pipe(
        map(([data, parentData]: [Data, Data]) => Object.assign({}, data, parentData)),
        tap((data: any) => this.initDSO(data.dso.payload)),
        switchMap(() => combineLatest([this.retrieveDataService(),this.getSecuritySettings()])),
      ).subscribe(([dataService, securitySettings]: [UpdateDataService<DSpaceObject>, MetadataSecurityConfiguration]) => {
        this.securitySettings$.next(securitySettings);
        this.initDataService(dataService);
        this.initForm();
        this.isFormInitialized$.next(true);
      });
    } else {
      this.initDSOType(this.dso);
      observableCombineLatest([this.retrieveDataService(), this.getSecuritySettings()])
        .subscribe(([dataService, securitySettings]: [UpdateDataService<DSpaceObject>, MetadataSecurityConfiguration]) => {
          this.securitySettings$.next(securitySettings);
          this.initDataService(dataService);
          this.initForm();
          this.isFormInitialized$.next(true);
        });
    }
    this.savingOrLoadingFieldValidation$ = observableCombineLatest([this.saving$, this.loadingFieldValidation$]).pipe(
      map(([saving, loading]: [boolean, boolean]) => saving || loading),
    );
  }

  /**
   * Get the security settings for the current DSpaceObject,
   * based on entityType (e.g. Person)
   */
  getSecuritySettings(): Observable<MetadataSecurityConfiguration> {
    if (this.dso instanceof Item) {
      const entityType: string = (this.dso as Item).entityType;
      return this.metadataSecurityConfigurationService.findById(entityType).pipe(
        getFirstCompletedRemoteData(),
        map((securitySettingsRD: RemoteData<MetadataSecurityConfiguration>) => {
          return securitySettingsRD.hasSucceeded ? securitySettingsRD.payload : null;
        }),
      );
    } else {
      of(null);
    }
  }

  /**
   * Resolve the data-service for the current DSpaceObject and retrieve its instance
   */
  retrieveDataService(): Observable<UpdateDataService<DSpaceObject>> {
    if (hasNoValue(this.updateDataService)) {
      const lazyProvider$: Observable<UpdateDataService<DSpaceObject>> = lazyDataService(this.dataServiceMap, this.dsoType, this.parentInjector);
      return lazyProvider$;
    } else {
      return of(this.updateDataService);
    }
  }

  /**
   * Initialise the current DSpaceObject
   */
  initDSO(object: DSpaceObject) {
    this.dso = object;
    this.initDSOType(object);
  }

  /**
   * Initialise the current DSpaceObject's type
   */
  initDSOType(object: DSpaceObject) {
    let type: ResourceType;
    if (typeof object.type === 'string') {
      type = new ResourceType(object.type);
    } else {
      type = object.type;
    }
    this.dsoType = type.value;
  }

  /**
   * Initialise the data-service for the current DSpaceObject
   */
  initDataService(dataService: UpdateDataService<DSpaceObject>): void {
    if (isNotEmpty(dataService)) {
      this.updateDataService = dataService;
    }
  }

  /**
   * Initialise the dynamic form object by passing the DSpaceObject's metadata
   * Call onValueSaved() to update the form's state properties
   */
  initForm(): void {
    this.form = new DsoEditMetadataForm(this.dso.metadata);
    this.onValueSaved();
    this.cdr.detectChanges();
  }

  /**
   * Update the form's state properties
   */
  onValueSaved(): void {
    this.hasChanges = this.form.hasChanges();
    this.isReinstatable = this.form.isReinstatable();
    this.isEmpty = Object.keys(this.form.fields).length === 0;
  }

  /**
   * Submit the current changes to the form by retrieving json PATCH operations from the form and sending it to the
   * DSpaceObject's data-service
   * Display notificiations and reset the form afterwards if successful
   */
  submit(): void {
    this.saving$.next(true);
    this.updateDataService.patch(this.dso, this.form.getOperations(this.arrayMoveChangeAnalyser)).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((rd: RemoteData<DSpaceObject>) => {
      this.saving$.next(false);
      if (rd.hasFailed) {
        this.notificationsService.error(this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.error.title`), rd.errorMessage);
      } else {
        this.notificationsService.success(
          this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.saved.title`),
          this.translateService.instant(`${this.dsoType}.edit.metadata.notifications.saved.content`),
        );
        this.dso = rd.payload;
        this.initForm();
      }
    });
  }

  /**
   * Confirm the newly added value
   * @param saved Whether or not the value was manually saved (only then, add the value to its metadata field)
   */
  confirmNewValue(saved: boolean): void {
    if (saved) {
      this.setMetadataField();
    }
  }

  /**
   * Set the metadata field of the temporary added new metadata value
   * This will move the new value to its respective parent metadata field
   * Validate the metadata field first
   */
  setMetadataField(): void {
    this.form.resetReinstatable();
    this.loadingFieldValidation$.next(true);
    this.metadataFieldSelectorComponent.validate().subscribe((valid: boolean) => {
      this.loadingFieldValidation$.next(false);
      if (valid) {
        this.form.setMetadataField(this.newMdField);
        this.setSecurityLevelForNewMdField();
        this.onValueSaved();
      }
    });
  }

  /**
   * Add a new temporary metadata value
   */
  add(): void {
    this.newMdField = undefined;
    this.form.add();
  }

  /**
   * Discard all changes within the current form
   */
  discard(): void {
    this.form.discard();
    this.onValueSaved();
  }

  /**
   * Restore any changes previously discarded from the form
   */
  reinstate(): void {
    this.form.reinstate();
    this.onValueSaved();
  }

  /**
   * Keep track of the metadata field that is currently being edited / added
   * Reset the security level properties for the new metadata field
   * @param value The value of the new metadata field
   */
  onMdFieldChange(value: string){
    if (hasValue(value)) {
      this.newMdFieldWithSecurityLevelValue = null;
      this.hasSecurityMetadata = false;
    }
  }

  /**
   * Update the security level for the field at the given index
   */
  onUpdateSecurityLevel(securityLevel: number) {
    this.setSecurityLevelForNewMdField(securityLevel);
  }

  /**
   * Set the security level for the new metadata field
   * If the new metadata field has no security level yet, store the security level in a temporary variable
   * until the metadata field is validated and set.
   * @param securityLevel The security level to set for the new metadata field
   */
  setSecurityLevelForNewMdField(securityLevel?: number) {
    // if the metadata field already exists among the metadata fields,
    //  set the security level for the new metadata field in the right position
    if (hasValue(this.newMdField) && hasValue(this.form.fields[this.newMdField]) && this.hasSecurityMetadata) {
      const lastIndex = this.form.fields[this.newMdField].length - 1;
      const obj = this.form.fields[this.newMdField][lastIndex];

      if (hasValue(securityLevel)) {
        // metadata field is not set yet, so store the security level for the new metadata field
        this.newMdFieldWithSecurityLevelValue = securityLevel;
      } else {
        // metadata field is set, so set the security level for the new metadata field
        obj.change = DsoEditMetadataChangeType.ADD;
        const customSecurity = this.securitySettings$.value.metadataCustomSecurity[this.newMdField];
        const lastCustomSecurityLevel = customSecurity[customSecurity.length - 1];

        obj.newValue.securityLevel = this.newMdFieldWithSecurityLevelValue ?? lastCustomSecurityLevel;
      }
    }

    // if the security level value is changed before the metadata field is set,
    // store the security level in a temporary variable
    if (hasValue(securityLevel) && hasNoValue(this.form.fields[this.newMdField])) {
      this.newMdFieldWithSecurityLevelValue = securityLevel;
    }

    if (!this.hasSecurityMetadata) {
      // for newly added metadata fields, set the security level to the default security level
      // (in case there is no custom security level for the metadata field)
      const defaultSecurity = this.securitySettings$.value.metadataSecurityDefault;
      const lastDefaultSecurityLevel = defaultSecurity[defaultSecurity.length - 1];

      this.form.fields[this.newMdField][this.form.fields[this.newMdField].length - 1].newValue.securityLevel = lastDefaultSecurityLevel;
    }
  }

  /**
   * Check if the new metadata field has a security level
   */
  hasSecurityLevel(event: boolean) {
    this.hasSecurityMetadata = event;
  }

  /**
   * Unsubscribe from any open subscriptions
   */
  ngOnDestroy(): void {
    if (hasValue(this.dsoUpdateSubscription)) {
      this.dsoUpdateSubscription.unsubscribe();
    }
  }

}
