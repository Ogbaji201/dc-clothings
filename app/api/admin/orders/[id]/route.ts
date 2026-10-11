// import { NextResponse } from "next/server";
// // import { createClient } from "@/lib/supabase/server";
// import { createAdminClient } from "@/lib/supabase/admin";
// import { requireAdmin } from "@/lib/admin/requireAdmin";

// type RouteContext = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// const ORDER_STATUSES = [
//   "pending",
//   "confirmed",
//   "processing",
//   "shipped",
//   "delivered",
//   "cancelled",
// ] as const;

// const PAYMENT_STATUSES = [
//   "pending",
//   "paid",
//   "failed",
//   "refunded",
// ] as const;

// export async function PATCH(
//   request: Request,
//   { params }: RouteContext
// ) {
//   try {
//     const { id } = await params;

//     // ==========================================
//     // 1. VERIFY ADMIN AUTHORIZATION
//     // ==========================================

//     const authorizationResponse = await requireAdmin();

//     if (authorizationResponse) {
//       return authorizationResponse;
//     }

//     // ==========================================
//     // 1. VERIFY AUTHENTICATION
//     // ==========================================

//     // const supabase = await createClient();

//     // const {
//     //   data: { user },
//     // } = await supabase.auth.getUser();

//     // if (!user) {
//     //   return NextResponse.json(
//     //     {
//     //       error: "Unauthorized.",
//     //     },
//     //     {
//     //       status: 401,
//     //     }
//     //   );
//     // }

//     // ==========================================
//     // 2. READ REQUEST
//     // ==========================================

//     const body = await request.json();

//     const {
//       order_status,
//       payment_status,
//     } = body;

//     // ==========================================
//     // 3. VALIDATE STATUS VALUES
//     // ==========================================

//     if (
//       order_status !== undefined &&
//       !ORDER_STATUSES.includes(order_status)
//     ) {
//       return NextResponse.json(
//         {
//           error: "Invalid order status.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     if (
//       payment_status !== undefined &&
//       !PAYMENT_STATUSES.includes(
//         payment_status
//       )
//     ) {
//       return NextResponse.json(
//         {
//           error: "Invalid payment status.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     if (
//       order_status === undefined &&
//       payment_status === undefined
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "No order or payment status was provided.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const admin = createAdminClient();

//     // ==========================================
//     // 4. GET CURRENT ORDER
//     // ==========================================

//     const {
//       data: existingOrder,
//       error: orderLookupError,
//     } = await admin
//       .from("orders")
//       .select(`
//         id,
//         order_number,
//         order_status,
//         payment_status,
//         inventory_deducted_at
//       `)
//       .eq("id", id)
//       .single();

//     if (
//       orderLookupError ||
//       !existingOrder
//     ) {
//       return NextResponse.json(
//         {
//           error: "Order not found.",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     // ==========================================
//     // 5. DETERMINE WHETHER INVENTORY IS NEEDED
//     // ==========================================

//     const isBeingMarkedAsPaid =
//       payment_status === "paid" &&
//       existingOrder.payment_status !==
//         "paid";

//     // ==========================================
//     // 6. DEDUCT INVENTORY WHEN PAYMENT IS PAID
//     // ==========================================

//     if (isBeingMarkedAsPaid) {
//       const {
//         data: inventoryResult,
//         error: inventoryError,
//       } = await admin.rpc(
//         "deduct_order_inventory",
//         {
//           p_order_id: id,
//         }
//       );

//       if (inventoryError) {
//         console.error(
//           "Inventory deduction error:",
//           inventoryError
//         );

//         return NextResponse.json(
//           {
//             error:
//               inventoryError.message ||
//               "Unable to deduct inventory.",
//           },
//           {
//             status: 400,
//           }
//         );
//       }

//       if (
//         !inventoryResult ||
//         inventoryResult.success !== true
//       ) {
//         console.error(
//           "Unexpected inventory result:",
//           inventoryResult
//         );

//         return NextResponse.json(
//           {
//             error:
//               "Inventory could not be updated.",
//           },
//           {
//             status: 500,
//           }
//         );
//       }
//     }

//     // ==========================================
//     // 7. UPDATE ORDER
//     // ==========================================

//     const updates: Record<
//     string,
//     string
//     > = {
//     updated_at:
//         new Date().toISOString(),
//     };

//     if (order_status !== undefined) {
//     updates.order_status =
//         order_status;
//     } else if (isBeingMarkedAsPaid) {
//     updates.order_status =
//         "confirmed";
//     }

//     if (payment_status !== undefined) {
//     updates.payment_status =
//         payment_status;
//     }

//     const {
//       data: updatedOrder,
//       error: updateError,
//     } = await admin
//       .from("orders")
//       .update(updates)
//       .eq("id", id)
//       .select(`
//         id,
//         order_number,
//         order_status,
//         payment_status,
//         inventory_deducted_at,
//         updated_at
//       `)
//       .single();

//     if (updateError) {
//       console.error(
//         "Order update error:",
//         updateError
//       );

//       return NextResponse.json(
//         {
//           error:
//             "Unable to update order.",
//         },
//         {
//           status: 500,
//         }
//       );
//     }

//     // ==========================================
//     // 8. RETURN SUCCESS
//     // ==========================================

//     return NextResponse.json({
//       success: true,
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error(
//       "Admin order update error:",
//       error
//     );

//     return NextResponse.json(
//       {
//         error:
//           "Something went wrong while updating the order.",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // 1. Verify administrator authorization
    const authorizationResponse = await requireAdmin();

    if (authorizationResponse) {
      return authorizationResponse;
    }

    // 2. Read request body
    const body = await request.json();
    const { order_status, payment_status } = body;

    // 3. Validate supplied status values
    if (
      order_status !== undefined &&
      !ORDER_STATUSES.includes(order_status)
    ) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    if (
      payment_status !== undefined &&
      !PAYMENT_STATUSES.includes(payment_status)
    ) {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 }
      );
    }

    if (
      order_status === undefined &&
      payment_status === undefined
    ) {
      return NextResponse.json(
        { error: "No order or payment status was provided." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 4. Retrieve the existing order
    const {
      data: existingOrder,
      error: orderLookupError,
    } = await admin
      .from("orders")
      .select("id, order_number, order_status, payment_status")
      .eq("id", id)
      .maybeSingle();

    if (orderLookupError) {
      console.error("Order lookup error:", orderLookupError);

      return NextResponse.json(
        { error: "Unable to retrieve order." },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // 5. Payment status can only be changed by the verified
    // payment/refund workflow, not this fulfilment endpoint.
    // An unchanged value is accepted because the existing
    // frontend sends both statuses in its PATCH request.
    if (
      payment_status !== undefined &&
      payment_status !== existingOrder.payment_status
    ) {
      return NextResponse.json(
        {
          error:
            "Payment status cannot be changed through this endpoint. Use the verified payment or refund workflow.",
        },
        { status: 400 }
      );
    }

    // 6. Require an actual order-status change
    if (
      order_status === undefined ||
      order_status === existingOrder.order_status
    ) {
      return NextResponse.json(
        { error: "No order-status change was provided." },
        { status: 400 }
      );
    }

    // 7. Update fulfilment status only.
    // Do not deduct inventory or change payment status here.
    const {
      data: updatedOrder,
      error: updateError,
    } = await admin
      .from("orders")
      .update({
        order_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("order_status", existingOrder.order_status)
      .select(`
        id,
        order_number,
        order_status,
        payment_status,
        inventory_deducted_at,
        updated_at
      `)
      .maybeSingle();

    if (updateError) {
      console.error("Order update error:", updateError);

      return NextResponse.json(
        { error: "Unable to update order." },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error:
            "The order changed while you were editing it. Refresh the order and try again.",
        },
        { status: 409 }
      );
    }

    // 8. Return success
    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while updating the order.",
      },
      { status: 500 }
    );
  }
}
