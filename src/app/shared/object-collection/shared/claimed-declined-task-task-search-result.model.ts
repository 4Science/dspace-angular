import { SearchResult } from '../../../core/shared/search/models/search-result.model';
import { ClaimedTask } from '../../../core/tasks/models/claimed-task-object.model';

/**
 * Represents a search result object of a Declined ClaimedTask object (sent back to the Review Managers)
 */
export class ClaimedDeclinedTaskTaskSearchResult extends SearchResult<ClaimedTask> {
}
