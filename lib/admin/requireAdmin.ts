
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const configuredAdminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!configuredAdminEmail) {
    console.error(
      "ADMIN_EMAIL is not configured."
    );

    return NextResponse.json(
      { error: "Admin authorization is not configured." },
      { status: 500 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const authenticatedEmail =
    user.email?.trim().toLowerCase();

  if (
    !authenticatedEmail ||
    authenticatedEmail !== configuredAdminEmail
  ) {
    return NextResponse.json(
      { error: "Forbidden. Administrator access required." },
      { status: 403 }
    );
  }

  return null;
}
