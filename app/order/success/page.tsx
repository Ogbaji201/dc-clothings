"use client";

import { useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "650px",
          textAlign: "center",
          padding: "60px 30px",
        }}
      >
        <div
          style={{
            fontSize: "56px",
            marginBottom: "20px",
          }}
        >
          ✓
        </div>

        <p
          style={{
            fontSize: "13px",
            letterSpacing: "2px",
            fontWeight: 600,
            marginBottom: "15px",
          }}
        >
          DC CLOTHINGS
        </p>

        <h1
          style={{
            fontSize: "42px",
            marginBottom: "20px",
          }}
        >
          Payment Successful
        </h1>

        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.7,
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Thank you for your order.
          Your payment has been confirmed
          and we are now preparing your order.
        </p>

        <a
          href="/shop"
          style={{
            display: "inline-block",
            padding: "15px 30px",
            background: "#111",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Continue Shopping →
        </a>
      </section>
    </main>
  );
}