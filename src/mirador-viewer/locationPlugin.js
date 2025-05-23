import takeEvery from 'redux-saga/effects';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';

/** This will be called every time the SET_CANVAS action is dispatched */
const onCanvasChange = function* (action) {
  console.log(action);
}

const pluginSaga = function* () {
  /* `takeEvery` calls the associated function every time the action is dispatched */
  yield takeEvery([
    ActionTypes.SET_CANVAS,
    ActionTypes.RECEIVE_SEARCH,
    ActionTypes.REMOVE_SEARCH,
    ActionTypes.SET_WINDOW_VIEW_TYPE,
  ], onCanvasChange);
}

const myPlugin = {
  component: () => null,
  saga: pluginSaga,
}

export default myPlugin;
