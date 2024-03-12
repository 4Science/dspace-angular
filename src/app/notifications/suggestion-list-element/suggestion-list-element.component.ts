import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Suggestion } from 'src/app/core/notifications/models/suggestion.model';

import { Item } from '../../core/shared/item.model';
import { fadeIn } from '../../shared/animations/fade';
import { isNotEmpty } from '../../shared/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  ItemSearchResultListElementComponent
} from '../../../themes/custom/app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { SuggestionActionsComponent } from '../suggestion-actions/suggestion-actions.component';
import { SuggestionEvidencesComponent } from './suggestion-evidences/suggestion-evidences.component';
import { SuggestionApproveAndImport } from './suggestion-approve-and-import';

/**
 * Show all the suggestions by researcher
 */
@Component({
  selector: 'ds-suggestion-list-item',
  styleUrls: ['./suggestion-list-element.component.scss'],
  templateUrl: './suggestion-list-element.component.html',
  animations: [fadeIn],
  imports: [
    TranslateModule,
    ItemSearchResultListElementComponent,
    SuggestionActionsComponent,
    SuggestionEvidencesComponent
  ],
  standalone: true
})
export class SuggestionListElementComponent implements OnInit {

  @Input() object: Suggestion;

  @Input() isSelected = false;

  @Input() isCollectionFixed = false;

  public listableObject: any;

  public seeEvidence = false;

  /**
   * The component is used to Delete suggestion
   */
  @Output() ignoreSuggestionClicked = new EventEmitter();

  /**
   * The component is used to approve & import
   */
  @Output() approveAndImport = new EventEmitter();

  /**
   * New value whether the element is selected
   */
  @Output() selected = new EventEmitter<boolean>();

  /**
   * Initialize instance variables
   *
   * @param {NgbModal} modalService
   */
  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.listableObject = {
      indexableObject: Object.assign(new Item(), { id: this.object.id, metadata: this.object.metadata }),
      hitHighlights: {},
    };
  }

  /**
   * Approve and import the suggestion
   */
  onApproveAndImport(event: SuggestionApproveAndImport) {
    this.approveAndImport.emit(event);
  }

  /**
   * Delete the suggestion
   */
  onIgnoreSuggestion(suggestionId: string) {
    this.ignoreSuggestionClicked.emit(suggestionId);
  }

  /**
   * Change is selected value.
   */
  changeSelected(event) {
    this.isSelected = event.target.checked;
    this.selected.next(this.isSelected);
  }

  /**
   * See the Evidence
   */
  hasEvidences() {
    return isNotEmpty(this.object.evidences);
  }

  /**
   * Set the see evidence variable.
   */
  onSeeEvidences(seeEvidence: boolean) {
    this.seeEvidence = seeEvidence;
  }

}
