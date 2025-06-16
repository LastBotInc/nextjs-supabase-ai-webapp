"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/app/i18n/navigation";
import { staticLocales as locales } from "@/app/i18n/config";
import { useAuth } from "@/components/auth/AuthProvider";
import LocaleSwitcher from "./LocaleSwitcher";
import { useEffect, useState, useCallback, useRef } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import InnoleaseLogo from "./InnoleaseLogo";

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const { session, loading, isAdmin, error } = useAuth();
  const [, setEnabledLocales] = useState<string[]>(locales);
  const [showLoading, setShowLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch enabled locales
  const fetchEnabledLocales = useCallback(async () => {
    try {
      const response = await fetch("/api/languages");
      const { data, error } = await response.json();
      if (error) throw new Error(error);

      // Filter enabled languages and map to locale codes
      const enabled = data
        .filter((lang: { enabled: boolean }) => lang.enabled)
        .map((lang: { code: string }) => lang.code);

      setEnabledLocales(enabled);
    } catch (err) {
      console.error("Error fetching enabled locales:", err);
      // Fall back to static locales
      setEnabledLocales(locales);
    }
  }, []);

  useEffect(() => {
    fetchEnabledLocales();
  }, [fetchEnabledLocales]);

  // Force loading to false after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Force ending loading state after timeout");
        setShowLoading(false);
      }
    }, 3000); // Reduced timeout to 3 seconds since we improved auth state handling

    // If we have definitive auth state or error, update immediately
    if (!loading || error) {
      console.log("Auth state resolved:", { loading, error, session });
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [loading, error, session]);

  // Don't render navigation links until we have definitive auth state or error
  const shouldShowLinks = !showLoading || error;

  // Split path into parts and remove empty strings
  const pathParts = pathname?.split("/").filter(Boolean) || [];

  // Detect admin path - check after locale part (index 1 since locale is index 0)
  const isAdminPath = pathParts.length > 1 && pathParts[1] === "admin";

  // Navigation structure - this represents the dropdown menus
  const navigationStructure = [
    {
      id: "about-us",
      label: t("about_us"),
      items: [{ href: "/about", label: t("about_us") }],
    },
    {
      id: "business-leasing",
      label: t("business_leasing"),
      items: [
        { href: "/yritysleasing", label: t("business_leasing") },
        { href: "/autoleasing", label: t("car_leasing") },
        { href: "/kone-ja-laiteleasing", label: t("machine_leasing") },

        //{ href: "/kausiauto", label: t("seasonal_car") },
        //{ href: "/sijaisautopalvelu", label: t("replacement_car") },
        // { href: "/yhteiskayttoauto", label: t("shared_car") },
      ],
    },
    {
      id: "for-customers",
      label: t("for_customers"),
      items: [
        { href: "/autoilijan-opas", label: t("drivers_guide") },
        { href: "/autokannan-hallinnointi", label: t("fleet_management") },
        //{ href: "/auton-palautus", label: t("car_return_guide") },
        //{ href: "/leasingauton-palautusohje", label: t("leasing_car_return") },
        //{ href: "/sopimuksen-paattyminen", label: t("contract_termination") },
        //{ href: "/kilometrien-ilmoitus", label: t("mileage_reporting") },
        //{ href: "/maastavienti-asiakirja", label: t("export_documents") },
      ],
    },
    {
      id: "car-rental",
      label: t("car_rental"),
      items: [
        { href: "/minileasing", label: t("minileasing") },
        { href: "/auton-vuokraus", label: t("rent_car") },
        // { href: "/huollon-varaus", label: t("service_booking") },
        //{ href: "/rengaspalvelut", label: t("tire_services") },
      ],
    },
    {
      id: "current-topics",
      label: t("current_topics"),
      items: [
        { href: "/ajankohtaista", label: t("current_topics") },
        //{ href: "/kampanjat", label: t("campaigns") },
        //{ href: "/asiakastarinat", label: t("customer_stories") },
        //{ href: "/blogi", label: t("blog") },
        //{ href: "/uutiset", label: t("news") },
      ],
    },
    {
      id: "contact-info",
      label: t("contact_info"),
      items: [
        //{ href: "/myynti", label: t("sales") },
        // { href: "/jälkimarkkinointi", label: t("marketing") },
        //{ href: "/laskutus", label: t("contact_info") },
        { href: "/asiakaspalvelu", label: t("customer_service") },
        //{ href: "/tyopaikat", label: t("open_positions") },
      ],
    },
  ];

  // Admin links - only show if user is admin and auth is complete without errors
  const adminLinks =
    !loading && isAdmin && !error
      ? [
          { href: "/admin/analytics", label: t("admin.analytics") },
          { href: "/admin/blog", label: t("admin.blog") },
          { href: "/admin/users", label: t("admin.users") },
          { href: "/admin/contacts", label: t("admin.contacts") },
          { href: "/admin/calendar", label: t("admin.calendar") },
          { href: "/admin/landing-pages", label: t("admin.landingPages") },
          { href: "/admin/media", label: t("admin.media") },
          { href: "/admin/translations", label: t("admin.translations") },
          { href: "/auth/sign-out", label: t("signOut") },
        ]
      : [];

  // Add menu toggle function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle dropdown toggle
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const activeRef = dropdownRefs.current[activeDropdown];
        if (activeRef && !activeRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Close menu and dropdowns when path changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Handle scroll detection for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      // Always keep white background, remove scroll effect for background change
      // if (window.scrollY > 10) {
      //   setIsScrolled(true);
      // } else {
      //   setIsScrolled(false);
      // }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={!loading && isAdmin && isAdminPath ? "/admin/blog" : "/"} className="flex items-center">
              <InnoleaseLogo width={215} height={42} />
            </Link>
            {isAdmin && isAdminPath && <span className="text-piki text-2xl self-center py-4">{t("admin_link")}</span>}
          </div>

          {/* Desktop Navigation */}
          {!loading && isAdmin && isAdminPath ? (
            // Admin navigation
            <div className="hidden md:flex items-center space-x-4 mx-auto">
              {shouldShowLinks &&
                adminLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname?.endsWith(href) ? "text-white bg-piki" : "text-piki hover:text-piki/80 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
            </div>
          ) : (
            // Main navigation with dropdowns
            <div className="hidden md:flex items-center space-x-2 mx-auto">
              {shouldShowLinks &&
                navigationStructure.map((section) => (
                  <div
                    key={section.id}
                    ref={(el) => {
                      dropdownRefs.current[section.id] = el;
                      return undefined;
                    }}
                    className="relative"
                  >
                    <button
                      onClick={() => toggleDropdown(section.id)}
                      className={`px-3 pb-2 pt-8 rounded-md text-lg font-medium transition-colors flex items-center ${
                        activeDropdown === section.id
                          ? "text-white bg-piki"
                          : "text-piki hover:text-piki/80 hover:bg-gray-100"
                      }`}
                      aria-expanded={activeDropdown === section.id}
                    >
                      {section.label}
                      {activeDropdown === section.id ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                    {activeDropdown === section.id && (
                      <div className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                        <div className="py-1">
                          {section.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`block px-4 py-2 text-sm text-piki hover:bg-gray-100 ${
                                pathname?.endsWith(item.href) ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Locale Switcher */}
            <LocaleSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-piki hover:text-piki/80 hover:bg-gray-100 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-y-0 right-0 w-full md:hidden bg-white transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="pt-20 pb-3 px-4">
          {/* Show admin or main navigation based on path */}
          {!loading && isAdmin && isAdminPath ? (
            <>
              {adminLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname?.endsWith(href) ? "text-white bg-piki" : "text-piki hover:text-piki/80 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/"
                className="block px-3 py-2 mt-4 rounded-md text-base font-medium text-piki hover:text-piki/80 hover:bg-gray-100 border-t border-gray-200"
              >
                {t("backToSite")}
              </Link>
            </>
          ) : (
            <>
              {/* Navigation structure for mobile */}
              {navigationStructure.map((section) => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleDropdown(section.id)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium ${
                      activeDropdown === section.id
                        ? "text-white bg-piki"
                        : "text-piki hover:text-piki/80 hover:bg-gray-100"
                    }`}
                  >
                    {section.label}
                    {activeDropdown === section.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {activeDropdown === section.id && (
                    <div className="mt-1 pl-4 border-l-2 border-gray-200 ml-3">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-3 py-2 rounded-md text-sm font-medium ${
                            pathname?.endsWith(item.href)
                              ? "text-white bg-piki"
                              : "text-piki hover:text-piki/80 hover:bg-gray-100"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Mobile Locale Switcher */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-center justify-between px-3 py-2">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
