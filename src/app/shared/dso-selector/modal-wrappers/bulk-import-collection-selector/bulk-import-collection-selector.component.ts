import { NgIf } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { getBulkImportRoute } from '../../../../app-routing-paths';
import { Collection } from '../../../../core/shared/collection.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../../core/shared/dspace-object-type.model';
import { AdministeredCollectionSelectorComponent } from '../../dso-selector/administered-collection-selector/administered-collection-selector.component';
import {
  DSOSelectorModalWrapperComponent,
  SelectorActionType,
} from '../dso-selector-modal-wrapper.component';

@Component({
  selector: 'ds-bulk-import-collection-selector',
  templateUrl: './bulk-import-collection-selector.component.html',
  imports: [
    TranslateModule,
    NgIf,
    AdministeredCollectionSelectorComponent,
  ],
  standalone: true,
})
export class BulkImportSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {
  objectType = DSpaceObjectType.ITEM;
  selectorTypes = [DSpaceObjectType.COLLECTION];
  action = SelectorActionType.IMPORT_ITEM;
  header = 'dso-selector.import-item.sub-level';

  /**
   * If present this value is used to filter collection list by entity type
   */
  @Input() entityType: string;

  constructor(protected activeModal: NgbActiveModal, protected route: ActivatedRoute, private router: Router) {
    super(activeModal, route);
  }

  /**
   * Navigate to the bulk import page
   */
  navigate(dso: DSpaceObject) {
    this.router.navigate([getBulkImportRoute(dso as Collection)]);
  }
}
