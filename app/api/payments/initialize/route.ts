import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. GET ORDER FROM DATABASE
    // --------------------------------------------------

    const supabase = createAdminClient();

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        total_amount,
        order_status,
        payment_status
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(
        "Payment order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          error: "Order could not be found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 2. CHECK ORDER STATUS
    // --------------------------------------------------

    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          error:
            "This order has already been paid for.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. CHECK CUSTOMER EMAIL
    // --------------------------------------------------

    if (!order.customer_email) {
      return NextResponse.json(
        {
          error:
            "A customer email is required for payment.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. GENERATE UNIQUE PAYSTACK REFERENCE
    // --------------------------------------------------

    const reference =
      `${order.order_number}-${Date.now()}`;

    // --------------------------------------------------
    // 5. CONVERT NAIRA TO KOBO
    // --------------------------------------------------

    const amountInKobo =
      Math.round(
        Number(order.total_amount) * 100
      );

    // --------------------------------------------------
    // 6. INITIALIZE PAYSTACK TRANSACTION
    // --------------------------------------------------

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              order.customer_email,

            amount:
              amountInKobo.toString(),

            currency: "NGN",

            reference,

            metadata: {
              order_id:
                order.id,

              order_number:
                order.order_number,

              customer_name:
                order.customer_name,
            },
          }),
        }
      );

    const paystackData =
      await paystackResponse.json();

    // --------------------------------------------------
    // 7. HANDLE PAYSTACK ERROR
    // --------------------------------------------------

    if (
      !paystackResponse.ok ||
      !paystackData.status
    ) {
      console.error(
        "Paystack initialization error:",
        paystackData
      );

      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Unable to initialize payment.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 8. SAVE PAYMENT REFERENCE
    // --------------------------------------------------

    const {
      error: updateOrderError,
    } = await supabase
      .from("orders")
      .update({
        payment_reference:
          paystackData.data.reference,
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error(
        "Payment reference update error:",
        updateOrderError
      );

      return NextResponse.json(
        {
          error:
            "Payment was initialized but the order could not be updated.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. RETURN PAYMENT INFORMATION
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      orderId:
        order.id,

      orderNumber:
        order.order_number,

      authorizationUrl:
        paystackData.data.authorization_url,

      accessCode:
        paystackData.data.access_code,

      reference:
        paystackData.data.reference,
    });

  } catch (error) {
    console.error(
      "Unexpected payment initialization error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while initializing payment.",
      },
      { status: 500 }
    );
  }
}