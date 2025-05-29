import { takeEvery, select } from 'redux-saga/effects';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';
import { getCanvasIndex } from 'mirador/dist/es/src/state/selectors';

/**
 * Extract id from the url.
 * URLs are in the format of "https://domain-name/server/iiif/392363fe-015f-41e6-8cdd-b5c754605787/canvas/03c322b7-0182-44fa-8dc3-5d2efcece237"
 */
const extractCanvasId = (canvasUrl) => canvasUrl.split('/').pop();

/** This will be called every time the SET_CANVAS action is dispatched */
const onCanvasChange = function* (action) {
  const { windowId, canvasId } = action;
  if (windowId && canvasId) {
    const canvasIndex = yield select(getCanvasIndex, { windowId });
    const canvasId = extractCanvasId(action.canvasId);

    const message = {
      type: 'update-url',
      // index here starts from 0, whilst for setting the index it starts from 1.
      canvasIndex: canvasIndex + 1,
      canvasId: canvasId
    };

    const isValidId = canvasId && canvasId !== 'undefined';
    const isBrowserEnvironment = typeof window !== 'undefined';

    if (isValidId && isBrowserEnvironment) {
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
