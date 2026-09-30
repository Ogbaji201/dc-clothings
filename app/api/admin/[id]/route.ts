import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
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
    /*
     * First verify that the person making the request
     * is authenticated.
     */
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

    const { orderStatus, paymentStatus } = body;

    /*
     * Validate order status if one was supplied.
     */
    if (
      orderStatus !== undefined &&
      !ORDER_STATUSES.includes(orderStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    /*
     * Validate payment status if one was supplied.
     */
    if (
      paymentStatus !== undefined &&
      !PAYMENT_STATUSES.includes(paymentStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 }
      );
    }

    if (
      orderStatus === undefined &&
      paymentStatus === undefined
    ) {
      return NextResponse.json(
        { error: "No changes were provided." },
        { status: 400 }
      );
    }

    /*
     * Use the server-only admin client for the update.
     */
    const supabase = createAdminClient();

    const updates: {
      order_status?: string;
      payment_status?: string;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (orderStatus !== undefined) {
      updates.order_status = orderStatus;
    }

    if (paymentStatus !== undefined) {
      updates.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select(
        `
        id,
        order_number,
        order_status,
        payment_status,
        updated_at
        `
      )
      .single();

    if (error) {
      console.error("Order update error:", error);

      return NextResponse.json(
        { error: "We could not update this order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the order." },
      { status: 500 }
    );
  }
}