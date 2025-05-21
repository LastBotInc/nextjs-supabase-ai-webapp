export const isProduction = () => process.env.NODE_ENV === "production";

export const isVercel = () => !!process.env.VERCEL;

export const isNextPhase = () => !!process.env.NEXT_PHASE;

export const hasUrlForNetwork = () => !!process.env.NEXT_PUBLIC_SITE_URL;

export const isBuildPhase = () => isNextPhase() || isVercel();
