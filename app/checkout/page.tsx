"use client";

import { FormEvent, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  // --------------------------------------------------
  // HANDLE FORM CHANGES
  // --------------------------------------------------

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // --------------------------------------------------
  // SUBMIT CHECKOUT
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // ----------------------------------------------
      // SEND CART + CUSTOMER INFORMATION TO API
      // ----------------------------------------------

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            cartItems: items,
            customer: formData,
          }),
        }
      );

      const data =
        await response.json();

      // ----------------------------------------------
      // HANDLE API ERROR
      // ----------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create your order."
        );
      }

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      console.log(
        "Order successfully created:",
        data
      );

      if(!data.authorizationUrl) {
        throw new Error(
          "Unable to initialize payment for your order."
        );
      }

      window.location.href =
        data.authorizationUrl;
      
      return

      alert(
        `Order created successfully!\n\nOrder Number: ${data.orderNumber}\n\nTotal: ₦${Number(
          data.totalAmount
        ).toLocaleString()}`
      );
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (items.length === 0) {
    return (
      <>
        <Header />

        <main className="checkout-page">
          <section className="checkout-empty">
            <p className="checkout-eyebrow">
              CHECKOUT
            </p>

            <h1>
              Your cart is empty
            </h1>

            <p>
              Add some products to your
              cart before proceeding to
              checkout.
            </p>

            <a
              href="/shop"
              className="checkout-continue-button"
            >
              Continue Shopping
              <span>→</span>
            </a>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  // --------------------------------------------------
  // CHECKOUT PAGE
  // --------------------------------------------------

  return (
    <>
      <Header />

      <main className="checkout-page">

        {/* HEADER */}

        <section className="checkout-header">
          <p className="checkout-eyebrow">
            DC CLOTHINGS
          </p>

          <h1>
            Checkout
          </h1>

          <p>
            Complete your details below
            and we'll prepare your order
            for payment.
          </p>
        </section>

        {/* ERROR MESSAGE */}

        {errorMessage && (
          <div
            className="checkout-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <section className="checkout-content">

          {/* CHECKOUT FORM */}

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >

            {/* CUSTOMER INFORMATION */}

            <div className="checkout-form-section">

              <div className="checkout-section-heading">
                <span>01</span>

                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Tell us who we're preparing
                    this order for.
                  </p>
                </div>
              </div>

              <div className="checkout-fields">

                <div className="checkout-field checkout-field-full">

                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="checkout-field">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="checkout-field">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>
            </div>

            {/* DELIVERY INFORMATION */}

            <div className="checkout-form-section">

              <div className="checkout-section-heading">

                <span>02</span>

                <div>
                  <h2>
                    Delivery Information
                  </h2>

                  <p>
                    Where should we deliver
                    your order?
                  </p>
                </div>

              </div>

              <div className="checkout-fields">

                <div className="checkout-field">

                  <label htmlFor="country">
                    Country
                  </label>

                  <select
                    id="country"
                    name="country"
                    value={
                      formData.country
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="Nigeria">
                      Nigeria
                    </option>

                    <option value="United Kingdom">
                      United Kingdom
                    </option>

                    <option value="United States">
                      United States
                    </option>

                    <option value="Canada">
                      Canada
                    </option>

                    <option value="Ghana">
                      Ghana
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

                <div className="checkout-field">

                  <label htmlFor="state">
                    State / Region
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g. Lagos"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="checkout-field">

                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. Ikeja"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="checkout-field checkout-field-full">

                  <label htmlFor="address">
                    Full Delivery Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    placeholder="Enter your complete delivery address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="checkout-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating Order..."
                : "Continue to Payment"}

              <span>→</span>
            </button>

          </form>

          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">

            <div className="checkout-summary-inner">

              <p className="checkout-summary-eyebrow">
                YOUR ORDER
              </p>

              <h2>
                Order Summary
              </h2>

              <div className="checkout-items">

                {items.map((item) => (

                  <div
                    key={
                      item.cartItemId
                    }
                    className="checkout-item"
                  >

                    <div className="checkout-item-image">

                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                        />
                      ) : (
                        <div>
                          No image
                        </div>
                      )}

                    </div>

                    <div className="checkout-item-details">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.color} /{" "}
                        {item.size}
                      </p>

                      <p>
                        Qty:{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <strong>
                      ₦
                      {(
                        Number(
                          item.price
                        ) *
                        item.quantity
                      ).toLocaleString()}
                    </strong>

                  </div>

                ))}

              </div>

              <div className="checkout-summary-lines">

                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₦
                    {subtotal.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery
                  </span>

                  <strong>
                    {deliveryFee === 0
                      ? "Calculated later"
                      : `₦${Number(deliveryFee).toLocaleString("en-NG")}`}
                  </strong>
                </div>

              </div>

              <div className="checkout-total">

                <span>
                  Total
                </span>

                <strong>
                  ₦
                  {total.toLocaleString()}
                </strong>

              </div>

              <div className="checkout-security">

                <span>
                  ✓
                </span>

                <p>
                  Secure payment will be
                  processed through our
                  trusted payment provider.
                </p>

              </div>

            </div>

          </aside>

        </section>

      </main>

      <Footer />
    </>
  );
}