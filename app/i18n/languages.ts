export interface Language {
  code: string;
  name: string;
  native_name: string;
  enabled?: boolean;
}

export const languages: Language[] = [
  { code: 'ar', name: 'Arabic', native_name: 'العربية' },
  { code: 'bn', name: 'Bengali', native_name: 'বাংলা' },
  { code: 'cs', name: 'Czech', native_name: 'Čeština' },
  { code: 'da', name: 'Danish', native_name: 'Dansk' },
  { code: 'de', name: 'German', native_name: 'Deutsch' },
  { code: 'el', name: 'Greek', native_name: 'Ελληνικά' },
  { code: 'en', name: 'English', native_name: 'English' },
  { code: 'es', name: 'Spanish', native_name: 'Español' },
  { code: 'et', name: 'Estonian', native_name: 'Eesti' },
  { code: 'fi', name: 'Finnish', native_name: 'Suomi' },
  { code: 'fr', name: 'French', native_name: 'Français' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
  { code: 'hu', name: 'Hungarian', native_name: 'Magyar' },
  { code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', native_name: 'Italiano' },
  { code: 'ja', name: 'Japanese', native_name: '日本語' },
  { code: 'ko', name: 'Korean', native_name: '한국어' },
  { code: 'lt', name: 'Lithuanian', native_name: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', native_name: 'Latviešu' },
  { code: 'nl', name: 'Dutch', native_name: 'Nederlands' },
  { code: 'no', name: 'Norwegian', native_name: 'Norsk' },
  { code: 'pl', name: 'Polish', native_name: 'Polski' },
  { code: 'pt', name: 'Portuguese', native_name: 'Português' },
  { code: 'ro', name: 'Romanian', native_name: 'Română' },
  { code: 'ru', name: 'Russian', native_name: 'Русский' },
  { code: 'sk', name: 'Slovak', native_name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', native_name: 'Slovenščina' },
  { code: 'sv', name: 'Swedish', native_name: 'Svenska' },
  { code: 'th', name: 'Thai', native_name: 'ไทย' },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', native_name: 'Українська' },
  { code: 'vi', name: 'Vietnamese', native_name: 'Tiếng Việt' },
  { code: 'zh', name: 'Chinese', native_name: '中文' }
]; 