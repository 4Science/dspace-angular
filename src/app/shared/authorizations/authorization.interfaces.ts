import { FeatureID } from "../../core/data/feature-authorization/feature-id";

export interface AuthorizationFeaturesConfig {
  [key: string]: FeatureID[]
}

export interface DiscoveryConfigurationFeaturesConfig {
  [key: string]: AuthorizationFeaturesConfig
}

export interface AuthorizationActionPayload {
  uuidList: string[],
  type?: string,
  featureIDs: FeatureID[],
  hrefs: string[]
}

export interface ObjectAuthorizationFeaturesMap {
  [key: string]: boolean;
}

export interface ObjectAuthorizationsState {
  [key: string]: ObjectAuthorizationFeaturesMap
}

export interface AuthorizationsState {
  authorizations: ObjectAuthorizationsState,
  hasError: boolean,
  pendingRequests?: string[],
  resolvedRequestId?: string
}
