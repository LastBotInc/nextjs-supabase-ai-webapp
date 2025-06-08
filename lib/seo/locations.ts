export interface Location {
  location_code: number;
  location_name: string;
  country_iso_code: string;
  language_code: string;
  language_name: string;
}

export const COMMON_LOCATIONS: Location[] = [
  {
    location_code: 2840,
    location_name: "United States",
    country_iso_code: "US",
    language_code: "en",
    language_name: "English"
  },
  {
    location_code: 2826,
    location_name: "United Kingdom",
    country_iso_code: "GB",
    language_code: "en",
    language_name: "English"
  },
  {
    location_code: 2246,
    location_name: "Finland",
    country_iso_code: "FI",
    language_code: "fi",
    language_name: "Finnish"
  },
  {
    location_code: 2752,
    location_name: "Sweden",
    country_iso_code: "SE",
    language_code: "sv",
    language_name: "Swedish"
  },
  {
    location_code: 2578,
    location_name: "Norway",
    country_iso_code: "NO",
    language_code: "nb",
    language_name: "Norwegian (Bokmål)"
  },
  {
    location_code: 2208,
    location_name: "Denmark",
    country_iso_code: "DK",
    language_code: "da",
    language_name: "Danish"
  },
  {
    location_code: 2276,
    location_name: "Germany",
    country_iso_code: "DE",
    language_code: "de",
    language_name: "German"
  },
  {
    location_code: 2250,
    location_name: "France",
    country_iso_code: "FR",
    language_code: "fr",
    language_name: "French"
  },
  {
    location_code: 2724,
    location_name: "Spain",
    country_iso_code: "ES",
    language_code: "es",
    language_name: "Spanish"
  },
  {
    location_code: 2380,
    location_name: "Italy",
    country_iso_code: "IT",
    language_code: "it",
    language_name: "Italian"
  },
  {
    location_code: 2528,
    location_name: "Netherlands",
    country_iso_code: "NL",
    language_code: "nl",
    language_name: "Dutch"
  },
  {
    location_code: 2040,
    location_name: "Austria",
    country_iso_code: "AT",
    language_code: "de",
    language_name: "German"
  },
  {
    location_code: 2756,
    location_name: "Switzerland",
    country_iso_code: "CH",
    language_code: "de",
    language_name: "German"
  },
  {
    location_code: 2124,
    location_name: "Canada",
    country_iso_code: "CA",
    language_code: "en",
    language_name: "English"
  },
  {
    location_code: 2036,
    location_name: "Australia",
    country_iso_code: "AU",
    language_code: "en",
    language_name: "English"
  }
];

export const DEFAULT_LOCATION = COMMON_LOCATIONS.find(loc => loc.country_iso_code === "FI") || COMMON_LOCATIONS[0]; 