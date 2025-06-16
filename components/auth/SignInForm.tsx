"use client";

import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { Session, AuthChangeEvent, Provider } from "@supabase/supabase-js";

export default function SignInForm() {
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();
  const t = useTranslations("Auth");
  const { session, isAdmin } = useAuth();

  useEffect(() => {
    setIsMounted(true);

    // Redirect if already signed in
    if (session) {
      window.location.href = isAdmin ? "/admin" : "/";
      return;
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session) {
        // Check if user is admin
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single();

        // Redirect based on admin status
        window.location.href = profile?.is_admin ? "/admin" : "/";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session, isAdmin, supabase]);

  // Don't render if not mounted or if we have a session
  if (!isMounted || session) {
    return null;
  }

  // Configure the auth UI for PKCE flow
  const authOptions = {
    supabaseClient: supabase,
    view: "sign_in" as const,
    appearance: {
      theme: ThemeSupa,
      variables: {
        default: {
          colors: {
            brand: "#2563eb",
            brandAccent: "#1d4ed8",
            inputText: "rgb(255, 255, 255)",
            inputBackground: "rgb(31, 41, 55)",
            inputBorder: "rgb(55, 65, 81)",
            inputLabelText: "rgb(209, 213, 219)",
            inputPlaceholder: "rgb(156, 163, 175)",
          },
        },
      },
      className: {
        input: "dark:bg-gray-800 dark:text-white dark:border-gray-700",
        label: "dark:text-gray-300",
        button: "dark:bg-blue-600 dark:hover:bg-blue-700",
        anchor: "dark:text-gray-300 hover:dark:text-gray-100",
        divider: "dark:before:bg-gray-700 dark:after:bg-gray-700 dark:text-gray-300",
      },
      style: {
        button: {
          backgroundColor: "rgb(31, 41, 55)",
          color: "rgb(209, 213, 219)",
        },
      },
    },
    showLinks: true,
    providers: ["github", "google"] as Provider[],
    redirectTo: `${window.location.origin}/auth/callback`,
    localization: {
      variables: {
        sign_in: {
          email_label: t("email"),
          password_label: t("password"),
          button_label: t("signIn"),
          loading_button_label: t("signingIn"),
          social_provider_text: t("continueWith"),
        },
      },
    },
    onlyThirdPartyProviders: false,
    magicLink: false,
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <Auth {...authOptions} />
    </div>
  );
}
