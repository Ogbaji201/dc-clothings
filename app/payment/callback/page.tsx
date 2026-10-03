import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

type CallbackPageProps = {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
};

export default async function PaymentCallback({
  searchParams,
}: CallbackPageProps) {
  const params = await searchParams;

  const reference =
    params.reference ||
    params.trxref;

  // --------------------------------------------------
  // 1. CHECK REFERENCE
  // --------------------------------------------------

  if (!reference) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Payment Reference Missing</h1>

          <p>
            We could not identify your payment.
          </p>
        </div>
      </main>
    );
  }

  // This will hold the order number only after
  // payment has been successfully verified.
  let successfulOrderNumber: string | null = null;

  try {
    const admin = createAdminClient();

    // --------------------------------------------------
    // 2. FIND ORDER
    // --------------------------------------------------

    const {
      data: order,
      error: orderError,
    } = await admin
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        payment_status,
        order_status,
        payment_reference,
        inventory_deducted_at
        `
      )
      .eq(
        "payment_reference",
        reference
      )
      .maybeSingle();

    if (orderError) {
      console.error(
        "Order lookup error:",
        orderError
      );

      throw new Error(
        "Unable to find your order."
      );
    }

    if (!order) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Order Not Found</h1>

            <p>
              We could not find an order
              associated with this payment.
            </p>

            <p>
              Reference: {reference}
            </p>
          </div>
        </main>
      );
    }

    // --------------------------------------------------
    // 3. VERIFY PAYMENT WITH PAYSTACK
    // --------------------------------------------------

    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },

          cache: "no-store",
        }
      );

    const paystackData =
      await paystackResponse.json();

    // The top-level status belongs to the
    // Paystack API request itself.
    if (
      !paystackResponse.ok ||
      !paystackData.status
    ) {
      console.error(
        "Paystack verification error:",
        paystackData
      );

      throw new Error(
        "Unable to verify payment."
      );
    }

    const transaction =
      paystackData.data;

    // --------------------------------------------------
    // 4. VERIFY REFERENCE
    // --------------------------------------------------

    if (
      transaction.reference !==
      reference
    ) {
      throw new Error(
        "Payment reference mismatch."
      );
    }

    // --------------------------------------------------
    // 5. VERIFY CURRENCY
    // --------------------------------------------------

    if (
      transaction.currency !==
      "NGN"
    ) {
      console.error(
        "Payment currency mismatch:",
        {
          expectedCurrency: "NGN",
          paidCurrency:
            transaction.currency,
          orderId: order.id,
        }
      );

      throw new Error(
        "Payment currency does not match the order."
      );
    }

    // --------------------------------------------------
    // 6. VERIFY PAYMENT STATUS
    // --------------------------------------------------

    if (
      transaction.status !==
      "success"
    ) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Payment Not Completed</h1>

            <p>
              Your payment has not been
              confirmed.
            </p>

            <p>
              Status:{" "}
              {transaction.status}
            </p>

            <p>
              Order:{" "}
              {order.order_number}
            </p>
          </div>
        </main>
      );
    }

    // --------------------------------------------------
    // 7. VERIFY PAYMENT AMOUNT
    // --------------------------------------------------

    const expectedAmount =
      Math.round(
        Number(order.total_amount) *
          100
      );

    const paidAmount =
      Number(transaction.amount);

    if (
      paidAmount !==
      expectedAmount
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          expectedAmount,
          paidAmount,
          orderId: order.id,
        }
      );

      throw new Error(
        "Payment amount does not match the order."
      );
    }

    // --------------------------------------------------
    // 8. DEDUCT INVENTORY
    // --------------------------------------------------

    if (
      !order.inventory_deducted_at
    ) {
      const {
        data: inventoryResult,
        error: inventoryError,
      } = await admin.rpc(
        "deduct_order_inventory",
        {
          p_order_id:
            order.id,
        }
      );

      if (inventoryError) {
        console.error(
          "Inventory deduction error:",
          inventoryError
        );

        throw new Error(
          inventoryError.message
        );
      }

      if (
        !inventoryResult?.success
      ) {
        throw new Error(
          inventoryResult?.message ||
            "Unable to deduct inventory."
        );
      }
    }

    // --------------------------------------------------
    // 9. MARK ORDER AS PAID
    // --------------------------------------------------

    const {
      error: updateError,
    } = await admin
      .from("orders")
      .update({
        payment_status:
          "paid",

        order_status:
          "confirmed",

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error(
        "Order payment update error:",
        updateError
      );

      throw new Error(
        "Payment was verified but the order could not be updated."
      );
    }

    // --------------------------------------------------
    // 10. PAYMENT SUCCESS
    // --------------------------------------------------

    // Store the order number so we can redirect
    // AFTER the try/catch block.
    successfulOrderNumber =
      order.order_number;

  } catch (error) {
    console.error(
      "Payment callback error:",
      error
    );

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "500px",
            background: "#fff",
            padding: "40px",
            borderRadius: "16px",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <h1>
            Payment Verification Failed
          </h1>

          <p>
            We received your payment
            response, but we could not
            complete the verification.
          </p>

          <p>
            Please contact DC Clothings
            with your order reference.
          </p>

          <p>
            Reference:
            <br />
            <strong>
              {reference}
            </strong>
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // 11. REDIRECT TO SUCCESS PAGE
  // --------------------------------------------------

  // IMPORTANT:
  // This must remain outside the try/catch.
  // Next.js redirect() throws a special
  // redirect exception internally.
  if (successfulOrderNumber) {
    redirect(
      `/order/success?order=${encodeURIComponent(
        successfulOrderNumber
      )}`
    );
  }

  // This should technically never be reached,
  // but keeps the function safe.
  return null;
}