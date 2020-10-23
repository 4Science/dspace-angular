
import { OpenaireBrokerTopicObject } from '../../../core/openaire/broker/models/openaire-broker-topic.model';
import {
  OpenaireBrokerTopicsActions,
  OpenaireBrokerTopicActionTypes
} from './openaire-broker-topics.actions';

// NB: The State is actually not really used because, at each call, all the contents are replaced
//     by fresh REST data. To be completed in the future by adding the management of the
//     pagination in the state and the necessary logic in the effects.

/**
 * The interface representing the OpenAIRE Broker topic state.
 */
export interface OpenaireBrokerTopicState {
  topics: OpenaireBrokerTopicObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  // To manage the pagination inside the State. Not used for now.
  totalLoadedPages: number;
}

/**
 * Used for the OpenAIRE Broker topic state initialization.
 */
const openaireBrokerTopicInitialState: OpenaireBrokerTopicState = {
  topics: [],
  processing: false,
  loaded: false,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  // To manage the pagination inside the State. Not used for now.
  totalLoadedPages: 0
};

/**
 * The OpenAIRE Broker Topic Reducer
 *
 * @param state
 *    the current state initialized with openaireBrokerTopicInitialState
 * @param action
 *    the action to perform on the state
 * @return OpenaireBrokerTopicState
 *    the new state
 */
export function openaireBrokerTopicsReducer(state = openaireBrokerTopicInitialState, action: OpenaireBrokerTopicsActions): OpenaireBrokerTopicState {
  switch (action.type) {
    case OpenaireBrokerTopicActionTypes.RETRIEVE_ALL_TOPICS: {
      return Object.assign({}, state, {
        processing: true
      });
    }

    case OpenaireBrokerTopicActionTypes.ADD_TOPICS: {
      return Object.assign({}, state, {
        topics: action.payload.topics,
        processing: false,
        loaded: true,
        totalPages: action.payload.totalPages,
        currentPage: state.currentPage,
        totalElements: action.payload.totalElements
      });
    }

    case OpenaireBrokerTopicActionTypes.RETRIEVE_ALL_TOPICS_ERROR: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
        currentPage: 0
      });
    }

    default: {
      return state;
    }
  }
}
