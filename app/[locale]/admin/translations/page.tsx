"use client";

import { createClient } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import TranslationEditor from "./TranslationEditor";
import SearchFilter from "./SearchFilter";
import LanguageManager from "./LanguageManager";
import { invalidateTranslationCache } from "@/app/i18n";
import { Locale } from "@/app/i18n/config";
import { useSearchParams } from "next/navigation";
import { getNamespaces } from "@/utils/i18n-helpers";

interface Translation {
  namespace: string;
  key: string;
  locale: string;
  value: string;
}

interface GroupedTranslation {
  namespace: string;
  key: string;
  translations: Record<string, string>;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

// Build a mapping for all namespaces
const namespacePathMap: { namespace: string; path: string; label: string }[] = getNamespaces().map((ns) => {
  switch (ns) {
    // Core pages
    case "About":
      return { namespace: ns, path: "/about", label: "About" };
    case "Account":
      return { namespace: ns, path: "/account", label: "Account" };
    case "Admin":
      return { namespace: ns, path: "/admin", label: "Admin" };
    case "Auth":
      return { namespace: ns, path: "/auth", label: "Authentication" };
    case "Blog":
      return { namespace: ns, path: "/blog", label: "Blog" };
    case "Common":
      return { namespace: ns, path: "/", label: "Common" };
    case "Contact":
      return { namespace: ns, path: "/contact", label: "Contact" };
    case "CookieConsent":
      return { namespace: ns, path: "/cookies", label: "Cookie Consent" };
    case "Footer":
      return { namespace: ns, path: "/", label: "Footer" };
    case "Index":
      return { namespace: ns, path: "/", label: "Home Page" };
    case "LandingPages":
      return { namespace: ns, path: "/[slug]", label: "Landing Pages" };
    case "Media":
      return { namespace: ns, path: "/admin/media", label: "Media" };
    case "Navigation":
      return { namespace: ns, path: "/", label: "Navigation" };
    case "Presentations":
      return { namespace: ns, path: "/presentations", label: "Presentations" };
    case "Privacy":
      return { namespace: ns, path: "/privacy", label: "Privacy" };
    case "Profile":
      return { namespace: ns, path: "/profile", label: "Profile" };
    
    // Business-specific pages (commented out as they don't exist in current namespace files)
    // case "Billing":
    //   return { namespace: ns, path: "/laskutus", label: "Laskutus" };
    // case "Campaigns":
    //   return { namespace: ns, path: "/kampanjat", label: "Kampanjat" };
    // case "Calculators":
    //   return { namespace: ns, path: "/laskurit", label: "Laskurit" };
    // case "CarLeasing":
    //   return { namespace: ns, path: "/autoleasing", label: "Autoleasing" };
    // case "CarRental":
    //   return { namespace: ns, path: "/auton-vuokraus", label: "Auton vuokraus" };
    // case "CorporateLeasing":
    //   return { namespace: ns, path: "/yritysleasing", label: "Yritysleasing" };
    // case "CurrentTopics":
    //   return { namespace: ns, path: "/uutiset", label: "Uutiset" };
    // case "CustomerService":
    //   return { namespace: ns, path: "/asiakaspalvelu", label: "Asiakaspalvelu" };
    // case "CustomerStories":
    //   return { namespace: ns, path: "/asiakastarinat", label: "Asiakastarinat" };
    // case "DigitalServices":
    //   return { namespace: ns, path: "/digitaaliset-palvelut", label: "Digitaaliset palvelut" };
    // case "DriversGuide":
    //   return { namespace: ns, path: "/autoilijan-opas", label: "Autoilijan opas" };
    // case "Faq":
    //   return { namespace: ns, path: "/ukk", label: "UKK" };
    // case "FinancialSolutions":
    //   return { namespace: ns, path: "/rahoitusratkaisut", label: "Rahoitusratkaisut" };
    // case "FleetManager":
    //   return { namespace: ns, path: "/fleet-manager", label: "Fleet Manager" };
    // case "Home":
    //   return { namespace: ns, path: "/", label: "Etusivu" };
    // case "LeasingCalculator":
    //   return { namespace: ns, path: "/leasing-laskuri", label: "Leasing-laskuri" };
    // case "LeasingSolutions":
    //   return { namespace: ns, path: "/leasingratkaisut", label: "Leasingratkaisut" };
    // case "MachineLeasing":
    //   return { namespace: ns, path: "/kone-ja-laiteleasing", label: "Kone- ja laiteleasing" };
    // case "MiniLeasing":
    //   return { namespace: ns, path: "/minileasing", label: "Minileasing" };
    // case "OpenPositions":
    //   return { namespace: ns, path: "/avoimet-tyopaikat", label: "Avoimet työpaikat" };
    // case "PostMarketing":
    //   return { namespace: ns, path: "/jalkimarkkinointi", label: "Jälkimarkkinointi" };
    // case "Sales":
    //   return { namespace: ns, path: "/myynti", label: "Myynti" };
    // case "ServicePrices":
    //   return { namespace: ns, path: "/palveluhinnasto", label: "Palveluhinnasto" };
    
    default:
      return { namespace: ns, path: ``, label: ns };
  }
});

export default function TranslationsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const t = useTranslations("Admin.translations");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const [selectedNamespace, setSelectedNamespace] = useState<string>(namespacePathMap[0].namespace);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching translations and languages...");
      try {
        // Fetch translations for selected namespace and language
        const translationsResponse = await fetch(
          `/api/translations?namespace=${encodeURIComponent(selectedNamespace)}&locale=${encodeURIComponent(
            selectedLanguage
          )}`
        );
        const { data: translationsData, error: translationsError } = await translationsResponse.json();
        if (translationsError) {
          throw new Error(translationsError);
        }
        // Fetch languages
        const languagesResponse = await fetch("/api/languages");
        const { data: languagesData, error: languagesError } = await languagesResponse.json();
        if (languagesError) {
          throw new Error(languagesError);
        }
        // console.log("Fetched translations:", translationsData);
        // console.log("Fetched languages:", languagesData);
        // console.log("Raw translations from API:", translationsData);
        setTranslations(translationsData || []);
        setLanguages(languagesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    // Initial fetch and refetch on namespace/language change
    fetchData();
    // Subscribe to changes
    const channel = supabase
      .channel("translations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "translations",
        },
        async () => {
          // Refetch all data when any change occurs
          await fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "languages",
        },
        async () => {
          // Refetch all data when languages change
          await fetchData();
        }
      )
      .subscribe();
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedNamespace, selectedLanguage]);

  useEffect(() => {
    if (languages.length > 0 && !languages.find((l) => l.code === selectedLanguage)) {
      setSelectedLanguage(languages[0].code);
    }
  }, [languages, selectedLanguage]);

  // Group translations by namespace and key
  const groupedTranslations = translations.reduce(
    (acc: Record<string, GroupedTranslation>, translation: Translation) => {
      const key = `${translation.namespace}.${translation.key}`;
      if (!acc[key]) {
        acc[key] = { namespace: translation.namespace, key: translation.key, translations: {} };
      }
      acc[key].translations[translation.locale] = translation.value;
      return acc;
    },
    {}
  );

  const translationGroups = Object.values(groupedTranslations) as GroupedTranslation[];

  // Filter translations based on search term
  const filteredTranslations = search
    ? translationGroups.filter(
        (group) =>
          group.namespace.toLowerCase().includes(search.toLowerCase()) ||
          group.key.toLowerCase().includes(search.toLowerCase()) ||
          Object.values(group.translations).some((value) => value.toLowerCase().includes(search.toLowerCase()))
      )
    : translationGroups;

  // Filter translations by selected namespace and language
  const filteredTranslationsByNamespace = filteredTranslations.filter((group) => group.namespace === selectedNamespace);

  const handleSave = async (namespace: string, key: string, locale: string, newValue: string) => {
    try {
      // Update local state optimistically
      setTranslations((prev) =>
        prev.map((t) =>
          t.namespace === namespace && t.key === key && t.locale === locale ? { ...t, value: newValue } : t
        )
      );
      // Get current session and access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated. Please sign in again.");

      // Update database through API with auth header
      const response = await fetch("/api/translations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          namespace,
          key,
          locale,
          value: newValue,
        }),
      });

      const { error } = await response.json();
      if (error) throw new Error(error);

      // Invalidate cache for the updated locale
      invalidateTranslationCache(locale as Locale);
    } catch (err) {
      console.error("Error saving translation:", err);
      // Revert local state on error by refetching translations
      const response = await fetch("/api/translations");
      const { data } = await response.json();
      if (data) {
        setTranslations(data);
      }
    }
  };

  const handleNamespaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNamespace(e.target.value);
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading translations...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8">Error loading translations: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">{t("title")}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t("description")}</p>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>{t("shortcuts.title")}</p>
          <ul className="mt-1 list-disc list-inside">
            <li>{t("shortcuts.enter")}</li>
            <li>{t("shortcuts.save")}</li>
            <li>{t("shortcuts.cancel")}</li>
          </ul>
        </div>
      </div>

      <LanguageManager />

      <SearchFilter />

      {/* Namespace Selector (shows label/path, value is namespace) */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <label className="font-semibold">Page:</label>
        <select
          value={selectedNamespace}
          onChange={handleNamespaceChange}
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
        >
          {namespacePathMap
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(({ namespace, label }) => (
              <option key={namespace} value={namespace}>
                {label}
              </option>
            ))}
        </select>
        <label className="font-semibold ml-4">Language:</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.native_name})
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900">
              <th className="px-4 py-2 text-left text-black dark:text-white">{t("table.key")}</th>
              <th className="px-4 py-2 text-left text-black dark:text-white">{t("table.value")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTranslationsByNamespace.map((group) => (
              <tr key={`${group.namespace}.${group.key}`} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{group.key}</td>
                <td className="px-4 py-2">
                  <TranslationEditor
                    namespace={group.namespace}
                    translationKey={group.key}
                    locale={selectedLanguage}
                    value={group.translations[selectedLanguage] || ""}
                    onSaveAction={(newValue) => handleSave(group.namespace, group.key, selectedLanguage, newValue)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
