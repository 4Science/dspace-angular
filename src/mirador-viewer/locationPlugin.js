import { takeEvery } from 'redux-saga/effects';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';

export

/** This will be called every time the SET_CANVAS action is dispatched */
const onCanvasChange = function* (action) {
  console.log('SET_CANVAS action: ', action);
  if(action.canvasId) {
    // IDs are in the format of "https://dspaceglam7dev.4science.cloud/server/iiif/392363fe-015f-41e6-8cdd-b5c754605787/canvas/03c322b7-0182-44fa-8dc3-5d2efcece237"
    const id = action.canvasId.split('/').pop();
    const message = {
      type: 'update-url',
      param: 'canvasId',
      canvasId: id
    };
    console.log('POSTING MESSAGE: ', message);
    if (id && id !== 'undefined') {
      window.parent.postMessage(message, '*');
    }
  }
}

const pluginSaga = function* () {
  /* `takeEvery` calls the associated function every time the action is dispatched */
  yield takeEvery([
    ActionTypes.SET_CANVAS,
  ], onCanvasChange);
}

const locationPlugin = {
  component: () => null,
  saga: pluginSaga,
}

export default locationPlugin;
