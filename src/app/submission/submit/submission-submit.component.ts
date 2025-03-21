import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  switchMap,
} from 'rxjs/operators';

import { SubmissionDefinitionsModel } from '../../core/config/models/config-submission-definitions.model';
import { ItemDataService } from '../../core/data/item-data.service';
import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { getAllSucceededRemoteData } from '../../core/shared/operators';
import { SubmissionObject } from '../../core/submission/models/submission-object.model';
import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';
import {
  hasValue,
  isEmpty,
  isNotEmptyOperator,
  isNotNull,
} from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { SubmissionService } from '../submission.service';

/**
 * This component allows to submit a new workspaceitem.
 */
@Component({
  selector: 'ds-base-submission-submit',
  styleUrls: ['./submission-submit.component.scss'],
  templateUrl: './submission-submit.component.html',
  standalone: true,
})
export class SubmissionSubmitComponent implements OnDestroy, OnInit {

  /**
   * The collection id this submission belonging to
   * @type {string}
   */
  public collectionId: string;

  /**
   * BehaviorSubject containing the self link to the item for this submission
   * @private
   */
  private itemLink$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * The item for this submission.
   */
  public item: Item;

  /**
   * The collection id input to create a new submission
   * @type {string}
   */
  public collectionParam: string;

  /**
   * The list of submission's sections
   * @type {WorkspaceitemSectionsObject}
   */
  public sections: WorkspaceitemSectionsObject;

  /**
   * The entity type input to create a new submission
   * @type {string}
   */
  public entityTypeParam: string;

  /**
   * The submission self url
   * @type {string}
   */
  public selfUrl: string;

  /**
   * The configuration object that define this submission
   * @type {SubmissionDefinitionsModel}
   */
  public submissionDefinition: SubmissionDefinitionsModel;

  /**
   * The submission id
   * @type {string}
   */
  public submissionId: string;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  protected subs: Subscription[] = [];


  /**
   * Initialize instance variables
   *
   * @param {ChangeDetectorRef} changeDetectorRef
   * @param {NotificationsService} notificationsService
   * @param {ItemDataService} itemDataService
   * @param {SubmissionService} submissionService
   * @param {Router} router
   * @param {TranslateService} translate
   * @param {ViewContainerRef} viewContainerRef
   * @param {ActivatedRoute} route
   */
  constructor(private changeDetectorRef: ChangeDetectorRef,
              private notificationsService: NotificationsService,
              private router: Router,
              private itemDataService: ItemDataService,
              private submissionService: SubmissionService,
              private translate: TranslateService,
              private viewContainerRef: ViewContainerRef,
              private route: ActivatedRoute) {
    this.route
      .queryParams
      .subscribe((params) => {
        this.collectionParam = (params.collection);
        this.entityTypeParam = (params.entityType);
      });
  }

  /**
   * Create workspaceitem on the server and initialize all instance variables
   */
  ngOnInit() {
    // NOTE execute the code on the browser side only, otherwise it is executed twice
    this.subs.push(
      this.submissionService.createSubmission(this.collectionParam, this.entityTypeParam)
        .subscribe((submissionObject: SubmissionObject) => {
          // NOTE new submission is created on the browser side only
          if (isNotNull(submissionObject)) {
            if (isEmpty(submissionObject)) {
              this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
              this.router.navigate(['/mydspace']);
            } else {
              this.router.navigate(['/workspaceitems', submissionObject.id, 'edit'], { replaceUrl: true });
            }
          }
        }),
      this.itemLink$.pipe(
        isNotEmptyOperator(),
        switchMap((itemLink: string) =>
          this.itemDataService.findByHref(itemLink),
        ),
        getAllSucceededRemoteData(),
        // Multiple sources can update the item in quick succession.
        // We only want to rerender the form if the item is unchanged for some time
        debounceTime(300),
      ).subscribe((itemRd: RemoteData<Item>) => {
        this.item = itemRd.payload;
        this.changeDetectorRef.detectChanges();
      }),
    );
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy() {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());

    this.viewContainerRef.clear();
    this.changeDetectorRef.markForCheck();
  }

}
