import { Config } from './config.interface';

export interface InfoConfig extends Config {
  enableEndUserAgreement: boolean;
  enablePrivacyStatement: boolean;
  enableGeneralInformation: boolean;
  enableOfferedServices: boolean;
  enableHistoryDigital: boolean;
  enableOrgStructure: boolean;
}
