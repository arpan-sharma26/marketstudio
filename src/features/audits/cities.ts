import { City } from "country-state-city";

import { getCountryCodeByName } from "@/features/audits/countries";

export interface CityOption {
  label: string;
  country: string;
}

interface CachedCity {
  label: string;
  name: string;
  searchText: string;
}

const cityCache = new Map<string, CachedCity[]>();

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function formatCityLabel(name: string, stateCode?: string): string {
  return stateCode ? `${name}, ${stateCode}` : name;
}

function getCitiesForCountryCode(countryCode: string): CachedCity[] {
  const cached = cityCache.get(countryCode);
  if (cached) return cached;

  const cities = City.getCitiesOfCountry(countryCode) ?? [];
  const seen = new Set<string>();
  const mapped: CachedCity[] = [];

  for (const city of cities) {
    const label = formatCityLabel(city.name, city.stateCode);
    if (seen.has(label)) continue;
    seen.add(label);
    mapped.push({
      label,
      name: city.name,
      searchText: normalizeSearchText(`${city.name} ${city.stateCode ?? ""} ${label}`),
    });
  }

  mapped.sort((a, b) => a.label.localeCompare(b.label));
  cityCache.set(countryCode, mapped);
  return mapped;
}

/**
 * Filter cities for a country display name (e.g. "India", "Canada").
 * Uses the full `country-state-city` world city dataset for that country.
 */
export function filterCities(
  query: string,
  countryName: string,
  limit = 12,
): CityOption[] {
  const countryCode = getCountryCodeByName(countryName);
  if (!countryCode) return [];

  const cities = getCitiesForCountryCode(countryCode);
  const trimmed = normalizeSearchText(query);
  const countryLabel = countryName.trim() || countryCode;

  if (!trimmed) {
    // Large country datasets (e.g. India, US) are unwieldy as an A–Z dump.
    // Require typing so suggestions stay useful; small countries can still preview.
    if (cities.length > 40) return [];
    return cities.slice(0, limit).map((city) => ({
      label: city.label,
      country: countryLabel,
    }));
  }

  const startsWith: CachedCity[] = [];
  const includes: CachedCity[] = [];

  for (const city of cities) {
    if (city.searchText.startsWith(trimmed)) {
      startsWith.push(city);
    } else if (trimmed.length >= 2 && city.searchText.includes(trimmed)) {
      includes.push(city);
    }
  }

  return [...startsWith, ...includes].slice(0, limit).map((city) => ({
    label: city.label,
    country: countryLabel,
  }));
}
