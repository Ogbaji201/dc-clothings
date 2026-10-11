import { NextResponse } from "next/server";

import crypto from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

import { sendOrderConfirmationEmail } from "@/lib/email/orderConfirmation";

import { sendAdminPaidOrderNotification } from "@/lib/email/adminPaidOrderNotification";

export const runtime = "nodejs";

export async function POST(request: Request) {

  try {

    // --------------------------------------------------

    // 1. GET RAW REQUEST BODY

    // --------------------------------------------------

    const rawBody = await request.text();

    // --------------------------------------------------

    // 2. GET PAYSTACK SIGNATURE

    // --------------------------------------------------

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {

      return NextResponse.json(

        {

          error: "Missing Paystack signature.",

        },

        { status: 401 },

      );

    }

    // --------------------------------------------------

    // 3. GET PAYSTACK SECRET KEY

    // --------------------------------------------------

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {

      console.error("PAYSTACK_SECRET_KEY is not configured.");

      return NextResponse.json(

        {

          error: "Webhook configuration error.",

        },

        { status: 500 },

      );

    }

    // --------------------------------------------------

    // 4. VERIFY PAYSTACK WEBHOOK SIGNATURE

    // --------------------------------------------------

    const expectedSignature = crypto

      .createHmac("sha512", secretKey)

      .update(rawBody)

      .digest("hex");

    const receivedBuffer = Buffer.from(signature, "utf8");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (

      receivedBuffer.length !== expectedBuffer.length ||

      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)

    ) {

      console.error("Invalid Paystack webhook signature.");

      return NextResponse.json(

        {

          error: "Invalid signature.",

        },

        { status: 401 },

      );

    }

    // --------------------------------------------------

    // 5. PARSE PAYSTACK EVENT

    // --------------------------------------------------

    let event: any;

    try {

      event = JSON.parse(rawBody);

    } catch (error) {

      console.error("Invalid webhook JSON payload:", error);

      return NextResponse.json(

        {

          error: "Invalid webhook payload.",

        },

        { status: 400 },

      );

    }

    console.log("Paystack webhook received:", event?.event);

    // --------------------------------------------------

    // 6. HANDLE ONLY SUCCESSFUL CHARGES

    // --------------------------------------------------

    if (event?.event !== "charge.success") {

      return NextResponse.json({

        received: true,

      });

    }

    // --------------------------------------------------

    // 7. GET TRANSACTION REFERENCE

    // --------------------------------------------------

    const reference = event?.data?.reference;

    if (

      typeof reference !== "string" ||

      reference.trim().length === 0

    ) {

      console.error(

        "Paystack webhook has no transaction reference.",

      );

      return NextResponse.json(

        {

          error: "Transaction reference is missing.",

        },

        { status: 400 },

      );

    }

    // --------------------------------------------------

    // 8. CREATE ADMIN SUPABASE CLIENT

    // --------------------------------------------------

    const supabase = createAdminClient();

    // --------------------------------------------------

    // 9. FIND ORDER

    // --------------------------------------------------

    const {

      data: order,

      error: orderError,

    } = await supabase

      .from("orders")

      .select(`

        id,

        order_number,

        customer_name,

        customer_phone,

        customer_email,

        delivery_address,

        delivery_city,

        delivery_state,

        subtotal,

        delivery_fee,

        total_amount,

        payment_reference,

        payment_status,

        order_status,

        inventory_deducted_at,

        confirmation_email_sent_at

      `)

      .eq("payment_reference", reference)

      .maybeSingle();

    if (orderError) {

      console.error("Order lookup error:", orderError);

      return NextResponse.json(

        {

          error: "Unable to find order.",

        },

        { status: 500 },

      );

    }

    if (!order) {

      console.error(

        "No order found for Paystack reference:",

        reference,

      );

      return NextResponse.json(

        {

          error: "Order not found.",

        },

        { status: 404 },

      );

    }

    // --------------------------------------------------

    // 10. VERIFY TRANSACTION DIRECTLY WITH PAYSTACK

    // --------------------------------------------------

    const verifyResponse = await fetch(

      `https://api.paystack.co/transaction/verify/${encodeURIComponent(

        reference,

      )}`,

      {

        method: "GET",

        headers: {

          Authorization: `Bearer ${secretKey}`,

        },

        cache: "no-store",

      },

    );

    let verifyData: any;

    try {

      verifyData = await verifyResponse.json();

    } catch (error) {

      console.error(

        "Unable to parse Paystack verification response:",

        error,

      );

      return NextResponse.json(

        {

          error: "Unable to verify payment.",

        },

        { status: 500 },

      );

    }

    if (!verifyResponse.ok || !verifyData?.status) {

      console.error(

        "Paystack transaction verification failed:",

        verifyData,

      );

      return NextResponse.json(

        {

          error: "Unable to verify payment.",

        },

        { status: 500 },

      );

    }

    const transaction = verifyData?.data;

    if (!transaction) {

      console.error(

        "Paystack verification returned no transaction data.",

      );

      return NextResponse.json(

        {

          error: "Invalid Paystack transaction response.",

        },

        { status: 500 },

      );

    }

    // --------------------------------------------------

    // 11. VERIFY TRANSACTION REFERENCE

    // --------------------------------------------------

    if (transaction.reference !== reference) {

      console.error("Paystack reference mismatch.", {

        webhookReference: reference,

        verifiedReference: transaction.reference,

      });

      return NextResponse.json(

        {

          error: "Payment reference mismatch.",

        },

        { status: 400 },

      );

    }

    // --------------------------------------------------

    // 12. VERIFY PAYMENT STATUS

    // --------------------------------------------------

    if (transaction.status !== "success") {

      console.log(

        "Paystack transaction is not successful:",

        transaction.status,

      );

      return NextResponse.json({

        received: true,

      });

    }

    // --------------------------------------------------

    // 13. VERIFY PAYMENT CURRENCY

    // --------------------------------------------------

    if (transaction.currency !== "NGN") {

      console.error(

        "Unexpected payment currency:",

        transaction.currency,

      );

      return NextResponse.json(

        {

          error: "Invalid payment currency.",

        },

        { status: 400 },

      );

    }

    // --------------------------------------------------

    // 14. VERIFY PAYMENT AMOUNT

    // --------------------------------------------------

    const expectedAmount = Math.round(

      Number(order.total_amount) * 100,

    );

    const paidAmount = Number(transaction.amount);

    if (

      !Number.isFinite(expectedAmount) ||

      !Number.isFinite(paidAmount) ||

      paidAmount !== expectedAmount

    ) {

      console.error("Payment amount mismatch:", {

        orderNumber: order.order_number,

        expectedAmount,

        paidAmount,

      });

      return NextResponse.json(

        {

          error: "Payment amount mismatch.",

        },

        { status: 400 },

      );

    }

      // --------------------------------------------------

      // 14A. HANDLE SUCCESSFUL PAYMENT FOR CANCELLED ORDERS

      // --------------------------------------------------

      if (order.order_status === "cancelled") {

        console.error(

          `MANUAL REVIEW REQUIRED: Payment succeeded for cancelled order ${order.order_number}.`,

        );

        // Record the verified successful payment, but do not

        // restore the order, deduct inventory, or send the

        // normal order confirmation email.

        if (order.payment_status !== "paid") {

          const { data: updatedOrder, error: updateError } =

            await supabase

              .from("orders")

              .update({

                payment_status: "paid",

                updated_at: new Date().toISOString(),

              })

              .eq("id", order.id)

              .neq("payment_status", "paid")

              .select("id")

              .maybeSingle();

          if (updateError) {

            console.error(

              `Unable to record payment for cancelled order ${order.order_number}:`,

              updateError,

            );

            return NextResponse.json(

              {

                error:

                  "Payment succeeded, but the payment status could not be recorded.",

              },

              { status: 500 },

            );

          }

          // No row may mean another webhook already recorded

          // the payment. Confirm the current status before

          // acknowledging the event.

          if (!updatedOrder) {

            const { data: currentOrder, error: readError } =

              await supabase

                .from("orders")

                .select("payment_status, order_status")

                .eq("id", order.id)

                .maybeSingle();

            if (

              readError ||

              !currentOrder ||

              currentOrder.payment_status !== "paid"

            ) {

              console.error(

                `Could not confirm payment status for cancelled order ${order.order_number}:`,

                readError,

              );

              return NextResponse.json(

                { error: "Unable to confirm recorded payment status." },

                { status: 500 },

              );

            }

          }

        }

        console.error(

          `MANUAL REVIEW REQUIRED: Order ${order.order_number} remains cancelled despite successful payment. Review for possible refund or other resolution.`,

        );

        // Retrieve item details for the urgent admin alert. This branch must
        // not deduct inventory or send the customer confirmation email.
        const { data: cancelledOrderItems, error: cancelledItemsError } =
          await supabase
            .from("order_items")
            .select("product_name, size, color, quantity, unit_price, total_price")
            .eq("order_id", order.id);

        if (cancelledItemsError) {
          console.error(
            `Unable to retrieve items for cancelled order ${order.order_number}:`,
            cancelledItemsError,
          );
          return NextResponse.json(
            { error: "Payment succeeded for a cancelled order, but notification details could not be retrieved." },
            { status: 500 },
          );
        }

        try {
          await sendAdminPaidOrderNotification({
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            deliveryAddress: order.delivery_address,
            deliveryCity: order.delivery_city,
            deliveryState: order.delivery_state,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.delivery_fee),
            totalAmount: Number(order.total_amount),
            paymentReference: reference,
            items: cancelledOrderItems ?? [],
            notificationType: "cancelled-order-payment",
          });
          console.log(`Urgent cancelled-order payment notification sent for ${order.order_number}`);
        } catch (notificationError) {
          console.error(
            `Urgent admin notification failed for cancelled order ${order.order_number}:`,
            notificationError,
          );
          return NextResponse.json(
            { error: "Payment succeeded for a cancelled order, but admin notification failed." },
            { status: 500 },
          );
        }

        // Acknowledge the successfully processed event so

        // Paystack does not repeatedly retry it.

        return NextResponse.json({

          received: true,

          success: true,

          manualReviewRequired: true,

          orderNumber: order.order_number,

        });

      }

      // 15. MARK PAYMENT AS PAID

    // --------------------------------------------------

  if (order.payment_status !== "paid") {

    const { error: updateOrderError } = await supabase

      .from("orders")

      .update({

        payment_status: "paid",

        updated_at: new Date().toISOString(),

      })

      .eq("id", order.id)

      .neq("payment_status", "paid");

    if (updateOrderError) {

      console.error(

        "Order payment update error:",

        updateOrderError,

      );

      return NextResponse.json(

        { error: "Unable to update order payment status." },

        { status: 500 },

      );

    }

  }

if (order.order_status === "pending") {

  const { data: confirmedOrder, error: orderStatusError } =

    await supabase

      .from("orders")

      .update({

        order_status: "confirmed",

        updated_at: new Date().toISOString(),

      })

      .eq("id", order.id)

      .eq("order_status", "pending")

      .select("id")

      .maybeSingle();

  if (orderStatusError) {

    console.error("Order status update error:", orderStatusError);

    return NextResponse.json(

      { error: "Unable to confirm order status." },

      { status: 500 },

    );

  }

  if (!confirmedOrder) {

    // The order may have changed while this webhook ran.

    const { data: currentOrder, error: currentOrderError } =

      await supabase

        .from("orders")

        .select("order_status, payment_status")

        .eq("id", order.id)

        .maybeSingle();

    if (

      currentOrderError ||

      !currentOrder ||

      currentOrder.payment_status !== "paid"

    ) {

      console.error(

        "Unable to verify current order status after payment:",

        currentOrderError,

      );

      return NextResponse.json(

        { error: "Unable to verify the order after payment." },

        { status: 500 },

      );

    }

    if (currentOrder.order_status === "cancelled") {

      console.error(

        `MANUAL REVIEW REQUIRED: Order ${order.order_number} was cancelled while payment was being processed.`,

      );

      return NextResponse.json({

        received: true,

        success: true,

        manualReviewRequired: true,

        orderNumber: order.order_number,

      });

    }

    if (currentOrder.order_status === "pending") {

      console.error(

        `Order ${order.order_number} remains pending after the confirmation update.`,

      );

      return NextResponse.json(

        { error: "Order confirmation could not be completed." },

        { status: 500 },

      );

    }

    // If the admin has already moved the order to another

    // non-cancelled status, preserve that status and continue.

  }

}

    // --------------------------------------------------

    // 16. DEDUCT INVENTORY

    // --------------------------------------------------

    //

    // The database RPC is idempotent.

    // If inventory has already been deducted,

    // it will not deduct it again.

    //

    const {

      data: inventoryResult,

      error: inventoryError,

    } = await supabase.rpc(

      "deduct_order_inventory",

      {

        p_order_id: order.id,

      },

    );

    if (inventoryError) {

      console.error(

        "Inventory deduction error:",

        inventoryError,

      );

      return NextResponse.json(

        {

          error:

            "Payment received but inventory processing failed.",

        },

        { status: 500 },

      );

    }

    console.log(

      "Inventory deduction result:",

      inventoryResult,

    );

    // --------------------------------------------------

    // 17. GET ORDER ITEMS FOR CONFIRMATION EMAIL

    // --------------------------------------------------

    const {

      data: orderItems,

      error: orderItemsError,

    } = await supabase

      .from("order_items")

      .select(`

        product_name,

        size,

        color,

        quantity,

        unit_price,

        total_price

      `)

      .eq("order_id", order.id);

    if (orderItemsError) {

      console.error(

        "Order items lookup error:",

        orderItemsError,

      );

      return NextResponse.json(

        {

          error:

            "Payment and inventory succeeded, but order email data could not be retrieved.",

        },

        { status: 500 },

      );

    }

// --------------------------------------------------

    // 17A. SEND ADMIN PAID-ORDER NOTIFICATION

    // --------------------------------------------------

    try {
      await sendAdminPaidOrderNotification({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        deliveryCity: order.delivery_city,
        deliveryState: order.delivery_state,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        totalAmount: Number(order.total_amount),
        paymentReference: reference,
        items: orderItems ?? [],
        notificationType: "paid-order",
      });
      console.log(`Admin paid-order notification sent for ${order.order_number}`);
    } catch (emailError) {
      console.error(
        `Admin paid-order notification failed for ${order.order_number}:`,
        emailError,
      );
      return NextResponse.json(
        { error: "Payment succeeded but admin notification failed." },
        { status: 500 },
      );
    }

    // --------------------------------------------------

    // --------------------------------------------------

    // 18. SEND ORDER CONFIRMATION EMAIL

    // --------------------------------------------------

    //

    // Do not send another email if this order has already

    // been successfully emailed.

    //

    if (!order.confirmation_email_sent_at) {

      try {

        await sendOrderConfirmationEmail({

          orderNumber: order.order_number,

          customerName: order.customer_name,

          customerEmail: order.customer_email,

          subtotal: Number(order.subtotal),

          deliveryFee: Number(order.delivery_fee),

          totalAmount: Number(order.total_amount),

          items: orderItems ?? [],

          idempotencyKey: `order-confirmation/${order.id}`,

        });

        // Only mark the email as sent AFTER Resend

        // successfully accepts the email.

        const {

          error: emailStatusError,

        } = await supabase

          .from("orders")

          .update({

            confirmation_email_sent_at:

              new Date().toISOString(),

            updated_at: new Date().toISOString(),

          })

          .eq("id", order.id)

          .is("confirmation_email_sent_at", null);

        if (emailStatusError) {

          console.error(

            "Unable to record confirmation email status:",

            emailStatusError,

          );

           // Resend accepted the email, but its sent status

          // was not recorded. Return 500 so Paystack retries.

          return NextResponse.json(

            {

              error:

                "Payment and email succeeded, but email status could not be recorded.",

            },

            { status: 500 },

          );

        } else {

          console.log(

            `Confirmation email sent for ${order.order_number}`,

          );

        }

      } catch (emailError) {

        console.error(

          `Order confirmation email failed for ${order.order_number}:`,

          emailError,

        );

        // Payment and inventory have already succeeded.

        // Return 500 so Paystack can retry the webhook.

        //

        // Resend's idempotency key prevents duplicate emails

        // if the previous request actually succeeded but the

        // response was lost.

        return NextResponse.json(

          {

            error:

              "Payment succeeded but confirmation email failed.",

          },

          { status: 500 },

        );

      }

    } else {

      console.log(

        `Confirmation email already sent for ${order.order_number}.`,

      );

    }

    // --------------------------------------------------

    // 19. SUCCESS

    // --------------------------------------------------

    console.log(

      `Order ${order.order_number} confirmed successfully.`,

    );

    return NextResponse.json({

      received: true,

      success: true,

      orderNumber: order.order_number,

    });

  } catch (error) {

    console.error(

      "Paystack webhook error:",

      error,

    );

    return NextResponse.json(

      {

        error: "Webhook processing failed.",

      },

      { status: 500 },

    );

  }

}