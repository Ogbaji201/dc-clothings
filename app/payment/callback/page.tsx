
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

type CallbackPageProps = {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
};

type ResultPageProps = {
  title: string;
  message: string;
  reference?: string;
  orderNumber?: string;
};

function ResultPage({
  title,
  message,
  reference,
  orderNumber,
}: ResultPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
          background: "#fff",
          padding: "36px 24px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1>{title}</h1>
        <p>{message}</p>

        {orderNumber && (
          <p>
            Order number: <strong>{orderNumber}</strong>
          </p>
        )}

        {reference && (
          <p>
            Payment reference: <strong>{reference}</strong>
          </p>
        )}

        <p>
          If you believe you completed payment successfully,
          please contact DCClothings with your order number
          or payment reference before attempting to pay again.
        </p>
      </div>
    </main>
  );
}

export default async function PaymentCallback({
  searchParams,
}: CallbackPageProps) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;

  if (!reference || !reference.trim()) {
    return (
      <ResultPage
        title="Payment Reference Missing"
        message="We could not identify your payment."
      />
    );
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured.");

      throw new Error("Payment verification is unavailable.");
    }

    const admin = createAdminClient();

    // 1. Find the order associated with this reference.
    const {
      data: order,
      error: orderError,
    } = await admin
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        payment_status,
        order_status,
        payment_reference
      `)
      .eq("payment_reference", reference)
      .maybeSingle();

    if (orderError) {
      console.error("Order lookup error:", orderError);

      throw new Error("Unable to retrieve the order.");
    }

    if (!order) {
      return (
        <ResultPage
          title="Order Not Found"
          message="We could not find an order associated with this payment."
          reference={reference}
        />
      );
    }

    // 2. Verify the transaction directly with Paystack.
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData?.status) {
      console.error(
        "Paystack verification error:",
        paystackData
      );

      throw new Error("Unable to verify the payment.");
    }

    const transaction = paystackData.data;

    if (!transaction || transaction.reference !== reference) {
      throw new Error("Payment reference mismatch.");
    }

    // 3. Confirm that Paystack reports a successful transaction.
    if (transaction.status !== "success") {
      return (
        <ResultPage
          title="Payment Not Completed"
          message={`Paystack has not confirmed a successful payment. Current transaction status: ${String(transaction.status ?? "unknown")}.`}
          reference={reference}
          orderNumber={order.order_number}
        />
      );
    }

    // 4. Verify currency.
    if (transaction.currency !== "NGN") {
      console.error("Payment currency mismatch:", {
        orderNumber: order.order_number,
        currency: transaction.currency,
      });

      throw new Error("Payment currency does not match the order.");
    }

    // 5. Verify the amount paid against the database order total.
    const expectedAmount = Math.round(
      Number(order.total_amount) * 100
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

      throw new Error("Payment amount does not match the order.");
    }

    // 6. Do not automatically fulfil cancelled orders.
    // A successful payment for a cancelled order needs review.
    if (order.order_status === "cancelled") {
      console.error(
        `Successful payment received for cancelled order ${order.order_number}. Manual review required.`
      );

      return (
        <ResultPage
          title="Payment Requires Review"
          message="Paystack reports a successful payment, but this order is cancelled. Please contact DCClothings for assistance. Do not attempt to pay again."
          reference={reference}
          orderNumber={order.order_number}
        />
      );
    }

    // 7. Deduct inventory using the existing idempotent RPC.
    // The database function protects against duplicate deductions.
    const {
      data: inventoryResult,
      error: inventoryError,
    } = await admin.rpc("deduct_order_inventory", {
      p_order_id: order.id,
    });

    if (inventoryError) {
      console.error(
        "Inventory deduction error:",
        inventoryError
      );

      throw new Error(
        "Payment was verified, but inventory processing failed."
      );
    }

    if (!inventoryResult?.success) {
      console.error(
        "Inventory deduction was not successful:",
        inventoryResult
      );

      throw new Error(
        inventoryResult?.message ||
          "Inventory could not be updated."
      );
    }

    // 8. Mark payment as paid without changing fulfilment status.
    const {
      error: paymentUpdateError,
    } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("payment_status", "paid");

    if (paymentUpdateError) {
      console.error(
        "Order payment update error:",
        paymentUpdateError
      );

      throw new Error(
        "Payment was verified, but the order payment status could not be updated."
      );
    }

    // 9. Confirm only if the order is still pending.
    // Preserve processing, shipped and delivered statuses.
    if (order.order_status === "pending") {
      const {
        data: statusUpdated,
        error: statusError,
      } = await admin
        .from("orders")
        .update({
          order_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("order_status", "pending")
        .select("id")
        .maybeSingle();

      if (statusError) {
        console.error(
          "Order confirmation status error:",
          statusError
        );

        throw new Error(
          "Payment was verified, but the order status could not be confirmed."
        );
      }

      // A concurrent admin update may have moved the order
      // forward. Accept that only if the current status is
      // no longer pending.
      if (!statusUpdated) {
        const {
          data: currentOrder,
          error: currentOrderError,
        } = await admin
          .from("orders")
          .select("order_status")
          .eq("id", order.id)
          .maybeSingle();

        if (
          currentOrderError ||
          !currentOrder ||
          currentOrder.order_status === "pending"
        ) {
          console.error(
            "Unable to confirm order after concurrent update:",
            currentOrderError
          );

          throw new Error(
            "Payment was verified, but the order status needs review."
          );
        }
      }
    }

    // The webhook handles the confirmation email.
    // Keep the customer callback focused on verification.
    redirect(
      `/order/success?order=${encodeURIComponent(
        order.order_number
      )}`
    );
  } catch (error) {
    // Next.js redirect() throws internally. Re-throw it so
    // the successful redirect is not mistaken for a failure.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Payment callback error:", error);

    return (
      <ResultPage
        title="Payment Verification Needs Attention"
        message="We received your payment response but could not complete all order updates. If you paid successfully, please contact DCClothings with your payment reference before attempting to pay again."
        reference={reference}
      />
    );
  }
}
