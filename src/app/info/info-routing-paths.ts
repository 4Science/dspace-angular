import { getInfoModulePath } from '../app-routing-paths';

export const END_USER_AGREEMENT_PATH = 'end-user-agreement';
export const FEEDBACK_PATH = 'feedback';
export const COAR_NOTIFY_SUPPORT = 'coar-notify-support';

// The path of the information pages that use glam.cms.* metadata should correspond to the metadata qualifier
export const GENERAL_INFORMATION_PATH = 'general-information';
export const OFFERED_SERVICES_PATH = 'offered-services';
export const HISTORY_DIGITAL_LID_PATH = 'history-digital-lid';
export const ORGANIZATIONAL_STRUCTURE_PATH = 'organizational-structure';
export const PRIVACY_PATH = 'privacy';

export function getEndUserAgreementPath() {
  return getSubPath(END_USER_AGREEMENT_PATH);
}

export function getPrivacyPath() {
  return getSubPath(PRIVACY_PATH);
}

export function getGeneralInformationPath() {
  return getSubPath(GENERAL_INFORMATION_PATH);
}

export function getOfferedServicesPath() {
  return getSubPath(OFFERED_SERVICES_PATH);
}

export function getHistoryDigitalPath() {
  return getSubPath(HISTORY_DIGITAL_LID_PATH);
}

export function getOrgStructurePath() {
  return getSubPath(ORGANIZATIONAL_STRUCTURE_PATH);
}

export function getFeedbackPath() {
  return getSubPath(FEEDBACK_PATH);
}

export function getCOARNotifySupportPath(): string {
  return getSubPath(COAR_NOTIFY_SUPPORT);
}

function getSubPath(path: string) {
  return `${getInfoModulePath()}/${path}`;
}
