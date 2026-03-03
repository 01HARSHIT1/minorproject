/**
 * Official portal URLs - hardcoded for now.
 * TODO: Make dynamic so users can add their own portal links.
 */

import { PortalType } from './entities/portal-connection.entity';

/** Official UPES MyUPES student portal URLs */
export const UPES_OFFICIAL_URLS = {
  login: 'https://myupes-beta.upes.ac.in/oneportal/app/auth/login',
  dashboard: 'https://myupes-beta.upes.ac.in/connectportal/user/student/home/dashboard',
} as const;

/**
 * Get the portal URL to use for a given portal type.
 * For UPES: always use official URL (permanent for now).
 * For others: use provided url (dynamic support later).
 */
export function getPortalUrl(portalType: PortalType, userProvidedUrl?: string): string {
  if (portalType === PortalType.UPES) {
    return UPES_OFFICIAL_URLS.login;
  }
  return userProvidedUrl || '';
}
