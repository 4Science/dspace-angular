import { FeatureID } from '../../core/data/feature-authorization/feature-id';

export interface AuthorizationFeaturesConfig {
  [key: string]: FeatureID[]
}

export interface DiscoveryConfigurationFeaturesConfig {
  [key: string]: AuthorizationFeaturesConfig
}

export interface ObjectAuthorizationFeaturesMap {
  [key: string]: boolean;
}

export interface ObjectAuthorizationsState {
  [key: string]: ObjectAuthorizationFeaturesMap
}
