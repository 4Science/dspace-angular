import { AsyncPipe, NgClass, NgComponentOutlet, NgForOf, NgIf, } from '@angular/common';
import { Component, Injector, Input, OnInit, ViewChild, } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertType } from '../../../shared/alert/alert-type';
import { isNotEmpty } from '../../../shared/empty.util';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsDirective } from '../sections.directive';
import { rendersSectionType } from '../sections-decorator';

/**
 * This component represents a section that contains the submission license form.
 */
@Component({
  selector: 'ds-submission-section-container',
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss'],
  imports: [
    AlertComponent,
    NgForOf,
    NgbAccordionModule,
    NgComponentOutlet,
    TranslateModule,
    NgClass,
    NgIf,
    AsyncPipe,
    SectionsDirective,
  ],
  standalone: true,
})
export class SubmissionSectionContainerComponent implements OnInit {

  /**
   * The collection id this submission belonging to
   * @type {string}
   */
  @Input() collectionId: string;
  /**
   * The entity type, needed in order to search for metadata level security
   */

  @Input() entityType: string;


  /**
   * The section data
   * @type {SectionDataObject}
   */
  @Input() sectionData: SectionDataObject;

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  /**
   * The AlertType enumeration
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * A boolean representing if a section has a info message to display
   * @type {Observable<boolean>}
   */
  public hasInfoMessage: Observable<boolean>;

  /**
   * A boolean representing if a section delete operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public isRemoving: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Injector to inject a section component with the @Input parameters
   * @type {Injector}
   */
  public objectInjector: Injector;

  /**
   * The [[JsonPatchOperationPathCombiner]] object
   * @type {JsonPatchOperationPathCombiner}
   */
  protected pathCombiner: JsonPatchOperationPathCombiner;

  /**
   * The SectionsDirective reference
   */
  @ViewChild('sectionRef') sectionRef: SectionsDirective;

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {JsonPatchOperationsBuilder} operationsBuilder
   * @param {TranslateService} translate
   */
  constructor(
    private injector: Injector,
    private operationsBuilder: JsonPatchOperationsBuilder,
    private translate: TranslateService) {
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit() {
    this.objectInjector = Injector.create({
      providers: [
        { provide: 'collectionIdProvider', useFactory: () => (this.collectionId), deps: [] },
        { provide: 'sectionDataProvider', useFactory: () => (this.sectionData), deps: [] },
        { provide: 'submissionIdProvider', useFactory: () => (this.submissionId), deps: [] },
        { provide: 'entityType', useFactory: () => (this.entityType), deps: [] },
      ],
      parent: this.injector,
    });
    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionData.id);
    const messageInfoKey = 'submission.sections.' + this.sectionData.header + '.info';
    this.hasInfoMessage = this.translate.get(messageInfoKey).pipe(
      map((message: string) => isNotEmpty(message) && messageInfoKey !== message),
    );
  }

  /**
   * Remove section from submission form
   *
   * @param event
   *    the event emitted
   */
  public removeSection(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isRemoving.value === false) {
      this.isRemoving.next(true);
      this.operationsBuilder.remove(this.pathCombiner.getPath());
      this.sectionRef.removeSection(this.submissionId, this.sectionData.id);
      setTimeout(() => {
        this.isRemoving.next(false);
      }, 1000);
    }
  }

  /**
   * Find the correct component based on the section's type
   */
  getSectionContent() {
    return rendersSectionType(this.sectionData.sectionType);
  }
}
