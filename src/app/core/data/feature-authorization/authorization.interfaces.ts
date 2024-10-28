import { FeatureID } from './feature-id';

export interface AuthorizationFeaturesConfig {
  [key: string]: FeatureID[]
}

export interface DiscoveryConfigurationFeaturesConfig {
  [key: string]: AuthorizationFeaturesConfig
}

export interface AuthorizationActionPayload {
  uuidList: string[],
  type?: string,
  featureIDs: FeatureID[]
}

export interface ObjectAuthorizationFeaturesMap {
  [key: string]: boolean;
};

export interface ObjectAuthorizationsState {
  [key: string]: ObjectAuthorizationFeaturesMap
}

export interface AuthorizationsState {
  authorizations: ObjectAuthorizationsState,
  loading: boolean,
  hasError: boolean,
  pendingObjects: string[]
}
