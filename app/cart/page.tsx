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
                  Delivery charges will be
                  calculated at checkout.
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