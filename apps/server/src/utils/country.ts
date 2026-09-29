import countries from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json' with { type: 'json' };
<<<<<<< HEAD
import { LOCAL_NETWORK_COUNTRY } from '@tracearr/shared';

export { LOCAL_NETWORK_COUNTRY };
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)

// Register English locale for country name lookups
countries.registerLocale(countriesEn);

<<<<<<< HEAD
=======
/** Constant for local network country value - must match geoip service */
export const LOCAL_NETWORK_COUNTRY = 'Local Network';

>>>>>>> e10e89cd (Limit image ownership changes to writable data)
/**
 * Normalize a country value to ISO 3166-1 alpha-2 code.
 * Handles both country names ("Italy") and codes ("IT").
 * Returns null if the country cannot be normalized.
 */
export function normalizeToCountryCode(country: string): string | null {
  if (!country || country === LOCAL_NETWORK_COUNTRY) {
    return null;
  }

  // If it's already a 2-letter code, validate and return uppercase
  if (country.length === 2) {
    const upper = country.toUpperCase();
    // Verify it's a valid country code
    if (countries.getName(upper, 'en')) {
      return upper;
    }
  }

  // Try to convert country name to code
  const code = countries.getAlpha2Code(country, 'en');
  if (code) {
    return code;
  }

  // Fallback: return the original value uppercase (might be a valid code)
  return country.length === 2 ? country.toUpperCase() : null;
}
<<<<<<< HEAD

/** Whether code is an ISO 3166-1 code; normalizeToCountryCode passes any two-letter value through. */
export function isCountryCode(code: string): boolean {
  return countries.isValid(code);
}
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
