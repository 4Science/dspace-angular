import { Config } from './config.interface';
import { ThirdPartyMetric } from './third-party-metric-config';

export interface InfoConfig extends Config {
  enableEndUserAgreement: boolean;
  enablePrivacyStatement: boolean;
  enableGeneralInformation: boolean;
  enableOfferedServices: boolean;
  enableHistoryDigital: boolean;
  enableOrgStructure: boolean;
  metricsConsents: ThirdPartyMetric[];
}
