import {
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
} from "next/dist/shared/lib/constants";

export const isProduction = () => process.env.NODE_ENV === "production";

export const isInVercel = () => !!process.env.VERCEL;

export const isInProductionBuildPhase = () =>
  process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
export const isInStaticExportPhase = () =>
  process.env.NEXT_PHASE === PHASE_EXPORT;

export const hasUrlForNetwork = () => !!process.env.NEXT_PUBLIC_SITE_URL;

export const isBuildPhase = () =>
  isInProductionBuildPhase() || isInStaticExportPhase();
