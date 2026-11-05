"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    fulfillmentMethod,
    setFulfillmentMethod
  } = useCart();

  return (
    <>
      <Header />

      <main className="cart-page">

        {/* =================================
            CART HEADER
        ================================= */}

        <section className="cart-header">

          <p className="cart-eyebrow">
            DC CLOTHINGS
          </p>

          <h1>Your Cart</h1>

          <p>
            Review your selected pieces
            before checkout.
          </p>

        </section>


        {/* =================================
            CART CONTENT
        ================================= */}

        <section className="cart-content">

          {items.length === 0 ? (

            <div className="empty-cart">

              <h2>
                Your cart is empty.
              </h2>

              <p>
                Explore our collection and
                find something you love.
              </p>

              <Link
                href="/shop"
                className="cart-continue-button"
              >
                Continue Shopping
                <span>→</span>
              </Link>

            </div>

          ) : (

            <div className="cart-layout">

              {/* ITEMS */}

              <div className="cart-items">

                <div className="cart-items-header">
                  <span>
                    {items.length}{" "}
                    {items.length === 1
                      ? "Item"
                      : "Items"}
                  </span>

                  <button
                    type="button"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>


                {items.map((item) => (

                  <article
                    key={item.cartItemId}
                    className="cart-item"
                  >

                    {/* IMAGE */}

                    <div className="cart-item-image">

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div>
                          No image
                        </div>
                      )}

                    </div>


                    {/* DETAILS */}

                    <div className="cart-item-details">

                      <div>

                        <h2>
                          {item.name}
                        </h2>

                        <p>
                          Colour:{" "}
                          {item.color}
                        </p>

                        <p>
                          Size:{" "}
                          {item.size}
                        </p>

                      </div>

                      <strong>
                        ₦
                        {Number(
                          item.price
                        ).toLocaleString()}
                      </strong>

                    </div>


                    {/* QUANTITY */}

                    <div className="cart-item-actions">

                      <div className="cart-quantity">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item.cartItemId
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item.cartItemId
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() =>
                          removeFromCart(
                            item.cartItemId
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </article>

                ))}

              </div>


        {/* FULFILMENT SELECTION */}

        <section className="cart-fulfillment">
          <p className="cart-summary-eyebrow">
            HOW WOULD YOU LIKE TO RECEIVE YOUR ORDER?
          </p>

      <div className="cart-fulfillment-options">

        <label
          className={`cart-fulfillment-option ${
            fulfillmentMethod === "pickup" ? "selected" : ""
          }`}
        >
          <input
            type="radio"
            name="fulfillment"
            value="pickup"
            checked={fulfillmentMethod === "pickup"}
            onChange={() => setFulfillmentMethod("pickup")}
          />

          <span>
            <strong>Store Pickup</strong>
            <small>
              Collect your order from our location in Challenge,
              Ibadan, between 10:00 AM and 5:00 PM.
              Please contact us before visiting.
            </small>
          </span>
        </label>

        <label
          className={`cart-fulfillment-option ${
            fulfillmentMethod === "delivery" ? "selected" : ""
          }`}
        >
          <input
            type="radio"
            name="fulfillment"
            value="delivery"
            checked={fulfillmentMethod === "delivery"}
            onChange={() => setFulfillmentMethod("delivery")}
          />

          <span>
            <strong>Delivery</strong>
            <small>
              Our sales representative will contact you within
              24 hours to confirm your delivery arrangements
              and applicable delivery charge.
            </small>
          </span>
        </label>

      </div>
    </section>



              {/* SUMMARY */}

              <aside className="cart-summary">

                <p className="cart-summary-eyebrow">
                  ORDER SUMMARY
                </p>

                <div className="cart-summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₦
                    {Number(
                      subtotal
                    ).toLocaleString()}
                  </strong>

                </div>

                <p className="cart-summary-note">
                 {fulfillmentMethod === "pickup"
                  ? "You have selected store pickup. No delivery charge applies."
                  : "Delivery charges are not included in this payment. Our sales representative will contact you within 24 hours."}
              </p>

                <Link
                  href="/checkout"
                  className="cart-checkout-button"
                >
                  Proceed to Checkout
                  <span>→</span>
                </Link>

                <Link
                  href="/shop"
                  className="cart-shopping-link"
                >
                  Continue Shopping
                </Link>

              </aside>

            </div>

          )}

        </section>

      </main>

      <Footer />
    </>
  );
}