import { Country } from "country-state-city";

/**
 * Country options for the AI Presence Audit typeahead.
 * Backed by the full ISO country list from `country-state-city` (~250 countries).
 */
export interface CountryOption {
  code: string;
  name: string;
}

const PRIORITY_CODES = new Set(["CA", "US"]);

let cachedCountries: CountryOption[] | null = null;

export function getAllCountries(): CountryOption[] {
  if (!cachedCountries) {
    cachedCountries = Country.getAllCountries()
      .map((country) => ({
        code: country.isoCode,
        name: country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return cachedCountries;
}

/** Resolve a country display name to its ISO code (e.g. "India" → "IN"). */
export function getCountryCodeByName(countryName: string): string | undefined {
  const trimmed = countryName.trim().toLowerCase();
  if (!trimmed) return undefined;

  const exact = getAllCountries().find((country) => country.name.toLowerCase() === trimmed);
  if (exact) return exact.code;

  // Allow partial exact-ish matches when the user typed a suggestion mid-edit.
  const startsWith = getAllCountries().find((country) =>
    country.name.toLowerCase().startsWith(trimmed),
  );
  return startsWith?.code;
}

/** Resolve an ISO code to its display name (e.g. "CA" → "Canada"). */
export function getCountryNameByCode(countryCode: string): string | undefined {
  const trimmed = countryCode.trim().toUpperCase();
  if (!trimmed) return undefined;
  return getAllCountries().find((country) => country.code === trimmed)?.name;
}

export function filterCountries(query: string, limit = 12): CountryOption[] {
  const countries = getAllCountries();
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [
      ...countries.filter((c) => PRIORITY_CODES.has(c.code)),
      ...countries.filter((c) => !PRIORITY_CODES.has(c.code)),
    ].slice(0, limit);
  }

  const startsWith: CountryOption[] = [];
  const includes: CountryOption[] = [];

  for (const country of countries) {
    const name = country.name.toLowerCase();
    const code = country.code.toLowerCase();

    if (name.startsWith(trimmed) || code === trimmed) {
      startsWith.push(country);
      continue;
    }

    // Avoid matching nearly every country on short queries like "i" or "a".
    if (trimmed.length >= 2 && (name.includes(trimmed) || code.includes(trimmed))) {
      includes.push(country);
    }
  }

  return [...startsWith, ...includes].slice(0, limit);
}
