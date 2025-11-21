
const CACHE_KEY = 'leblanc_countries_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CountryCache {
  timestamp: number;
  data: string[];
}

export async function getCountries(): Promise<string[]> {
  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed: CountryCache = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data;
      }
    } catch (e) {
      console.error('Error parsing country cache', e);
    }
  }

  // Fetch from API
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    // Extract common names and sort
    const countries = data
      .map((c: any) => c.name.common)
      .sort((a: string, b: string) => a.localeCompare(b));

    // Save to cache
    const cacheData: CountryCache = {
      timestamp: Date.now(),
      data: countries
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return empty array or fallback list if fetch fails
    return [];
  }
}
