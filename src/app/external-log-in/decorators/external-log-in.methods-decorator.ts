import { AuthRegistrationType } from '../../core/auth/models/auth.registration-type';
import { OrcidConfirmationComponent } from '../registration-types/orcid-confirmation/orcid-confirmation.component';

/**
 * Map to store the external login confirmation component for the given auth method type
 */
const authMethodsMap = new Map();

authMethodsMap.set(AuthRegistrationType.Orcid, OrcidConfirmationComponent);

/**
 * Decorator to register the external login confirmation component for the given auth method type
 * @param authMethodType the type of the external login method
 * @deprecated
 */
export function renderExternalLoginConfirmationFor(
  authMethodType: AuthRegistrationType,
) {
  return function decorator(objectElement: any) {
    if (!objectElement) {
      return;
    }
    authMethodsMap.set(authMethodType, objectElement);
  };
}
/**
 *  Get the external login confirmation component for the given auth method type
 * @param authMethodType the type of the external login method
 */
export function getExternalLoginConfirmationType(
  authMethodType: AuthRegistrationType,
) {
  return authMethodsMap.get(authMethodType);
}
