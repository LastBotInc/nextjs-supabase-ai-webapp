import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { invalidateTranslationCache } from "@/app/i18n";

function hasJsonSignature(str: string): boolean {
  if (typeof str !== "string") return false;
  // Quick check for object/array structure
  const trimmed = str.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return true;
  }
  return false;
}

function placeKeyValueToObject(
  target: any,
  key: string,
  value: string,
) {
  const keys = key.split(".");
  let current = target;
  const lastKey = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
  return target;
}

function convertDataSetToJSON(data: any) {
  const result: Record<string, Record<string, string>> = {};
  data.forEach(({ namespace, key, value }: any) => {
    if (!result[namespace]) {
      result[namespace] = {};
    }

    let parsedValue = value;
    if (hasJsonSignature(value)) {
      try {
        parsedValue = JSON.parse(value);
      } catch (error) {
        // ignore
      }
    }
    placeKeyValueToObject(result[namespace], key, parsedValue);
  });
  return result;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get("namespace");
    const locale = searchParams.get("locale");
    const groupNamespaces = searchParams.get("groupNamespaces");
    let query = supabase.from("translations").select("*");
    if (namespace) {
      query = query.eq("namespace", namespace);
    }
    if (locale) {
      query = query.eq("locale", locale);
    }
    query = query.order("namespace").order("key").order("locale");
    const { data, error } = await query;
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      data: groupNamespaces ? convertDataSetToJSON(data) : data,
    });
  } catch (err) {
    console.error("Error fetching translations:", err);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}

export async function PUT(request: Request) {
  try {
    // First verify user authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    // Use anon client for authentication
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(" ")[1],
    );

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user is admin
    const { data: profile } = await authClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    // Use service role client for database operations
    const supabase = createClient(undefined, true);

    const body = await request.json();
    const { namespace, key, locale, value } = body;

    const { error } = await supabase
      .from("translations")
      .upsert({
        namespace,
        key,
        locale,
        value,
        is_html: value.includes("<") && value.includes(">"),
        last_edited_by: user.id,
      }, {
        onConflict: "namespace,key,locale",
      });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for the updated locale
    invalidateTranslationCache(locale);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating translation:", err);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
