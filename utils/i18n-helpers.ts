/**
 * This file provides namespace management utilities for the i18n system.
 *
 * In Edge Runtime environments, we cannot use the Node.js file system modules,
 * so we use a pre-generated list of namespaces for both production and development.
 */

/**
 * Gets the list of available namespaces.
 * This function returns a pre-generated list of namespaces.
 */
export const getNamespaces = (): string[] => {
  // Pre-generated list of namespaces from the messages/en directory
  return [
    'About', 'Account', 'Admin', 'Auth',
    'Blog', 'Campaigns', 'CarBenefitCalculator', 'CarLeasing',
    'CarRental', 'Common', 'Contact', 'CookieConsent',
    'CorporateLeasing', 'CurrentTopics', 'CustomerService', 'CustomerStories', "DigitalServices",
    'DriversGuide', 'FleetManager', 'Footer', 'Home',
    'Index', 'LandingPages', 'LeasingSolutions', 'MachineLeasing',
    'Media', 'Meta', 'Navigation', 'OpenPositions',
    'Privacy', 'Profile'
  ];
};
