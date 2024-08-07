import { EPersonMock } from '../../shared/testing/eperson.mock';
import {
  AddAuthenticationMessageAction,
  AuthenticateAction,
  AuthenticatedAction,
  AuthenticatedErrorAction,
  AuthenticatedSuccessAction,
  AuthenticationErrorAction,
  AuthenticationSuccessAction,
  CheckAuthenticationTokenAction,
  CheckAuthenticationTokenCookieAction,
  LogOutAction,
  LogOutErrorAction,
  LogOutSuccessAction,
  RedirectWhenAuthenticationIsRequiredAction,
  RedirectWhenTokenExpiredAction,
  RefreshTokenAction,
  RefreshTokenAndRedirectSuccessAction,
  RefreshTokenErrorAction,
  RefreshTokenSuccessAction,
  ResetAuthenticationMessagesAction,
  RetrieveAuthenticatedEpersonErrorAction,
  RetrieveAuthenticatedEpersonSuccessAction,
  RetrieveAuthMethodsAction,
  RetrieveAuthMethodsErrorAction,
  RetrieveAuthMethodsSuccessAction,
  SetAuthCookieStatus,
  SetRedirectUrlAction,
  SetUserAsIdleAction,
  UnsetUserAsIdleAction,
} from './auth.actions';
import {
  authReducer,
  AuthState,
} from './auth.reducer';
import { AuthMethod } from './models/auth.method';
import { AuthMethodType } from './models/auth.method-type';
import { AuthStatus } from './models/auth-status.model';
import { AuthTokenInfo } from './models/auth-token-info.model';

describe('authReducer', () => {

  let initialState: AuthState;
  let state: AuthState;
  const mockTokenInfo = new AuthTokenInfo('test_token');
  const mockError = new Error('Test error message');

  it('should properly set the state, in response to a AUTHENTICATE action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: true,
      loading: false,
      idle: false,
    };
    const action = new AuthenticateAction('user', 'password');
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: true,
      error: undefined,
      loading: true,
      info: undefined,
      idle: false,
    };

    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a AUTHENTICATE_SUCCESS action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new AuthenticationSuccessAction(mockTokenInfo);
    const newState = authReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should properly set the state, in response to a AUTHENTICATE_ERROR action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new AuthenticationErrorAction(mockError);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      info: undefined,
      authToken: undefined,
      error: 'Test error message',
      idle: false,
    };

    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a AUTHENTICATED action', () => {
    initialState = {
      authenticated: false,
      blocking: false,
      loaded: false,
      error: undefined,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new AuthenticatedAction(mockTokenInfo);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      blocking: true,
      loaded: false,
      error: undefined,
      loading: true,
      info: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a AUTHENTICATED_SUCCESS action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new AuthenticatedSuccessAction(true, mockTokenInfo, EPersonMock._links.self.href);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a AUTHENTICATED_ERROR action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new AuthenticatedErrorAction(mockError);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      authToken: undefined,
      error: 'Test error message',
      loaded: true,
      blocking: false,
      loading: false,
      info: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a CHECK_AUTHENTICATION_TOKEN action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      idle: false,
    };
    const action = new CheckAuthenticationTokenAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: true,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a CHECK_AUTHENTICATION_TOKEN_COOKIE action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: true,
      idle: false,
    };
    const action = new CheckAuthenticationTokenCookieAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: true,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should set the authentication cookie status in response to a SET_AUTH_COOKIE_STATUS action', () => {
    initialState = {
      authenticated: true,
      loaded: false,
      blocking: false,
      loading: true,
      externalAuth: false,
      idle: false,
    };
    const action = new SetAuthCookieStatus(true);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      loaded: false,
      blocking: false,
      loading: true,
      externalAuth: true,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a LOG_OUT action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };

    const action = new LogOutAction();
    const newState = authReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should properly set the state, in response to a LOG_OUT_SUCCESS action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };

    const action = new LogOutSuccessAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      authToken: undefined,
      error: undefined,
      loaded: false,
      blocking: true,
      loading: true,
      info: undefined,
      refreshing: false,
      user: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a LOG_OUT_ERROR action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };

    const action = new LogOutErrorAction(mockError);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: 'Test error message',
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RETRIEVE_AUTHENTICATED_EPERSON_SUCCESS action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new RetrieveAuthenticatedEpersonSuccessAction(EPersonMock);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RETRIEVE_AUTHENTICATED_EPERSON_ERROR action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      error: undefined,
      blocking: true,
      loading: true,
      info: undefined,
      idle: false,
    };
    const action = new RetrieveAuthenticatedEpersonErrorAction(mockError);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      authToken: undefined,
      error: 'Test error message',
      loaded: true,
      blocking: false,
      loading: false,
      info: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a REFRESH_TOKEN action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };
    const newTokenInfo = new AuthTokenInfo('Refreshed token');
    const action = new RefreshTokenAction(newTokenInfo);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: true,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a REFRESH_TOKEN_SUCCESS action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: true,
      idle: false,
    };
    const newTokenInfo = new AuthTokenInfo('Refreshed token');
    const action = new RefreshTokenSuccessAction(newTokenInfo);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: newTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: false,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a REFRESH_TOKEN_ERROR action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: true,
      idle: false,
    };
    const action = new RefreshTokenErrorAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      authToken: undefined,
      error: undefined,
      loaded: false,
      blocking: false,
      loading: false,
      info: undefined,
      refreshing: false,
      user: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  beforeEach(() => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      idle: false,
    };

    state = {
      authenticated: false,
      authToken: undefined,
      loaded: false,
      blocking: false,
      loading: false,
      error: undefined,
      info: 'Message',
      user: undefined,
      idle: false,
    };
  });

  it('should properly set the state, in response to a REDIRECT_AUTHENTICATION_REQUIRED action', () => {
    const action = new RedirectWhenAuthenticationIsRequiredAction('Message');
    const newState = authReducer(initialState, action);
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a REDIRECT_TOKEN_EXPIRED action', () => {
    const action = new RedirectWhenTokenExpiredAction('Message');
    const newState = authReducer(initialState, action);
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a ADD_MESSAGE action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      idle: false,
    };
    const action = new AddAuthenticationMessageAction('Message');
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      info: 'Message',
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RESET_MESSAGES action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      error: 'Error',
      info: 'Message',
      idle: false,
    };
    const action = new ResetAuthenticationMessagesAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      error: undefined,
      info: undefined,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a SET_REDIRECT_URL action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      idle: false,
    };
    const action = new SetRedirectUrlAction('redirect.url');
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      redirectUrl: 'redirect.url',
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RETRIEVE_AUTH_METHODS action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      authMethods: [],
      idle: false,
    };
    const action = new RetrieveAuthMethodsAction(new AuthStatus());
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: true,
      authMethods: [],
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RETRIEVE_AUTH_METHODS_SUCCESS action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: true,
      loading: true,
      authMethods: [],
      idle: false,
    };
    const authMethods: AuthMethod[] = [
      new AuthMethod(AuthMethodType.Password, 0),
      new AuthMethod(AuthMethodType.Shibboleth, 1, 'location'),
    ];
    const action = new RetrieveAuthMethodsSuccessAction(authMethods);
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      authMethods: authMethods,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a RETRIEVE_AUTH_METHODS_ERROR action', () => {
    initialState = {
      authenticated: false,
      loaded: false,
      blocking: true,
      loading: true,
      authMethods: [],
      idle: false,
    };

    const action = new RetrieveAuthMethodsErrorAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: false,
      loaded: false,
      blocking: false,
      loading: false,
      authMethods: [new AuthMethod(AuthMethodType.Password, 0)],
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a SET_USER_AS_IDLE action', () => {
    initialState = {
      authenticated: true,
      loaded: true,
      blocking: false,
      loading: false,
      idle: false,
    };

    const action = new SetUserAsIdleAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      loaded: true,
      blocking: false,
      loading: false,
      idle: true,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a UNSET_USER_AS_IDLE action', () => {
    initialState = {
      authenticated: true,
      loaded: true,
      blocking: false,
      loading: false,
      idle: true,
    };

    const action = new UnsetUserAsIdleAction();
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      loaded: true,
      blocking: false,
      loading: false,
      idle: false,
    };
    expect(newState).toEqual(state);
  });

  it('should properly set the state, in response to a REFRESH_TOKEN_AND_REDIRECT_SUCCESS action', () => {
    initialState = {
      authenticated: true,
      authToken: mockTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: true,
      idle: false,
    };
    const newTokenInfo = new AuthTokenInfo('Refreshed token');
    const action = new RefreshTokenAndRedirectSuccessAction(newTokenInfo,'/redirect-url');
    const newState = authReducer(initialState, action);
    state = {
      authenticated: true,
      authToken: newTokenInfo,
      loaded: true,
      error: undefined,
      blocking: false,
      loading: false,
      info: undefined,
      user: EPersonMock,
      refreshing: false,
      idle: false,
    };
    expect(newState).toEqual(state);
  });
});
