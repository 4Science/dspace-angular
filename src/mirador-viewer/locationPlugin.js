import { takeEvery, select } from 'redux-saga/effects';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';
import {getCanvasIndex} from "mirador/dist/es/src/state/selectors";


/** This will be called every time the SET_CANVAS action is dispatched */
const onCanvasChange = function* (action) {
  const { windowId, canvasId } = action;
  if (windowId && canvasId) {
    const canvasIndex = yield select(getCanvasIndex, { windowId });
    // IDs are in the format of "https://dspaceglam7dev.4science.cloud/server/iiif/392363fe-015f-41e6-8cdd-b5c754605787/canvas/03c322b7-0182-44fa-8dc3-5d2efcece237"
    const id = action.canvasId.split('/').pop();
    const message = {
      type: 'update-url',
      // index here starts from 0, whilst for setting the index it starts from 1.
      canvasIndex: canvasIndex + 1,
      canvasId: id
    };
    if (id && id !== 'undefined' && typeof window !== 'undefined') {
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
