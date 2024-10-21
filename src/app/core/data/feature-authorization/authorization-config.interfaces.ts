import { FeatureID } from './feature-id';
import { AuthorizationFeaturesMap } from '../../shared/authorization.model';

export interface AuthorizationFeaturesConfig {
  [key: string]: FeatureID[]
}

export interface DiscoveryConfigurationFeaturesConfig {
  [key: string]: AuthorizationFeaturesConfig
}


export interface AuthorizationsMapState {
  [key: string]: AuthorizationFeaturesMap;
}

export interface AuthorizationsState {
  authorizations: AuthorizationsMapState,
  initialized: boolean,
  hasError: boolean,
}
