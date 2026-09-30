import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BULK_ORDER_STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "approved",
  "rejected",
  "completed",
];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const authSupabase = await createClient();

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!BULK_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid bulk order status." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("bulk_order_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        contact_person,
        organisation_name,
        status,
        updated_at
        `
      )
      .single();

    if (error) {
      console.error("Bulk order update error:", error);

      return NextResponse.json(
        { error: "We could not update this bulk enquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enquiry: data,
    });
  } catch (error) {
    console.error(
      "Admin bulk order update error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong while updating the enquiry." },
      { status: 500 }
    );
  }
}