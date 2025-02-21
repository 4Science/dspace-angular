import { HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  of as observableOf,
} from 'rxjs';

import { RemoteData } from '../data';
import { RequestEntryState } from '../data';

/**
 * A fixed timestamp to use in tests
 */
const FIXED_TIMESTAMP = new Date().getTime();

/**
 * Method to create a remote data object that has succeeded
 * @param object The object to wrap
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createSuccessfulRemoteDataObject<T>(object: T, timeCompleted = FIXED_TIMESTAMP): RemoteData<T> {
  return new RemoteData(
    timeCompleted,
    15 * 60 * 1000,
    timeCompleted,
    RequestEntryState.Success,
    undefined,
    object,
    200,
  );
}

/**
 * Method to create a remote data object that has succeeded, wrapped in an observable
 * @param object The object to wrap
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createSuccessfulRemoteDataObject$<T>(object: T, timeCompleted?: number): Observable<RemoteData<T>> {
  return observableOf(createSuccessfulRemoteDataObject(object, timeCompleted));
}

/**
 * Method to create a remote data object that has failed
 *
 * @param errorMessage  the error message
 * @param statusCode    the status code
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createFailedRemoteDataObject<T>(errorMessage?: string, statusCode?: number, timeCompleted = 1577836800000): RemoteData<T> {
  return new RemoteData(
    timeCompleted,
    15 * 60 * 1000,
    timeCompleted,
    RequestEntryState.Error,
    errorMessage,
    undefined,
    statusCode,
  );
}

/**
 * Method to create a remote data object that has failed, wrapped in an observable
 *
 * @param errorMessage  the error message
 * @param statusCode    the status code
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createFailedRemoteDataObject$<T>(errorMessage?: string, statusCode?: number, timeCompleted?: number): Observable<RemoteData<T>> {
  return observableOf(createFailedRemoteDataObject<T>(errorMessage, statusCode, timeCompleted));
}

/**
 * Method to create a remote data object that is still pending
 * @param lastVerified the moment when the remoteData was last verified
 */
export function createPendingRemoteDataObject<T>(lastVerified = FIXED_TIMESTAMP): RemoteData<T> {
  return new RemoteData(
    undefined,
    15 * 60 * 1000,
    lastVerified,
    RequestEntryState.ResponsePending,
    undefined,
    undefined,
    undefined,
  );
}

/**
 * Method to create a remote data object that is still pending, wrapped in an observable
 * @param lastVerified the moment when the remoteData was last verified
 */
export function createPendingRemoteDataObject$<T>(lastVerified?: number): Observable<RemoteData<T>> {
  return observableOf(createPendingRemoteDataObject<T>(lastVerified));
}

/**
 * Method to create a remote data object with no content
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createNoContentRemoteDataObject<T>(timeCompleted?: number): RemoteData<T> {
  return createSuccessfulRemoteDataObject(undefined, timeCompleted);
}

/**
 * Method to create a remote data object that has succeeded with no content, wrapped in an observable
 * @param timeCompleted the moment when the remoteData was completed
 */
export function createNoContentRemoteDataObject$<T>(timeCompleted?: number): Observable<RemoteData<T>> {
  return createSuccessfulRemoteDataObject$(undefined, timeCompleted);
}

/**
 * Method to create a remote data object that has failed starting from a given error
 *
 * @param error
 */
export function createFailedRemoteDataObjectFromError<T>(error: unknown): RemoteData<T> {
  const remoteData = createFailedRemoteDataObject<T>();
  if (error instanceof Error) {
    remoteData.errorMessage = error.message;
  }
  if (error instanceof HttpErrorResponse) {
    remoteData.statusCode = error.status;
  }
  return remoteData;
}

/**
 * Method to create a remote data object that has failed starting from a given error
 * @param error
 */
export function createFailedRemoteDataObjectFromError$<T>(error: unknown): Observable<RemoteData<T>> {
  return observableOf(createFailedRemoteDataObjectFromError<T>(error));
}
