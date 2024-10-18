import { FeatureID } from './feature-id';
import { AuthorizationFeaturesMap } from '../../shared/authorization.model';

export interface AuthorizationFeaturesConfig {
  [key: string]: FeatureID[]
}

export interface DiscoveryConfigurationFeaturesConfig {
  [key: string]: AuthorizationFeaturesConfig
}


export interface AuthorizationsState {
  [key: string]: AuthorizationFeaturesMap;
}
