// "use client";

// import { FormEvent, useState } from "react";

// import Header from "../components/Header";

// import Footer from "../components/Footer";

// import { useCart } from "../context/CartContext";

// export default function CheckoutPage() {

//   const {

//     items,

//     subtotal,

//     fulfillmentMethod,


//   } = useCart();

//   const [formData, setFormData] = useState({

//     fullName: "",

//     email: "",

//     phone: "",

//     country: "Nigeria",

//     state: "",

//     city: "",

//     address: "",

//   });

//   const [isSubmitting, setIsSubmitting] =

//     useState(false);

//   const [errorMessage, setErrorMessage] =

//     useState("");

//   // --------------------------------------------------

//   // DELIVERY + TOTAL

//   // --------------------------------------------------

//   // const deliveryFee = 5000;

//   const total = subtotal;

//   // --------------------------------------------------

//   // HANDLE FORM CHANGES

//   // --------------------------------------------------

//   function handleChange(

//     event: React.ChangeEvent<

//       HTMLInputElement |

//         HTMLSelectElement |

//         HTMLTextAreaElement

//     >

//   ) {

//     const {

//       name,

//       value,

//     } = event.target;

//     setFormData((current) => ({

//       ...current,

//       [name]: value,

//     }));

//   }

//   // --------------------------------------------------

//   // SUBMIT CHECKOUT

//   // --------------------------------------------------

//   async function handleSubmit(

//     event: FormEvent<HTMLFormElement>

//   ) {

//     event.preventDefault();

//     setIsSubmitting(true);

//     setErrorMessage("");

//     try {

//       // ----------------------------------------------

//       // SEND CART + CUSTOMER INFORMATION TO API

//       // ----------------------------------------------

//       const response = await fetch(

//         "/api/orders",

//         {

//           method: "POST",

//           headers: {

//             "Content-Type":

//               "application/json",

//           },

//           body: JSON.stringify({

//             cartItems: items,

//             customer: formData,
//             fulfillmentMethod: fulfillmentMethod,

//           }),

//         }

//       );

//       const data =

//         await response.json();

//       // ----------------------------------------------

//       // HANDLE API ERROR

//       // ----------------------------------------------

//       if (!response.ok) {

//         throw new Error(

//           data.error ||

//             "Unable to create your order."

//         );

//       }

//       // ----------------------------------------------

//       // VERIFY PAYSTACK URL

//       // ----------------------------------------------

//       if (

//         !data.authorizationUrl

//       ) {

//         throw new Error(

//           "Unable to initialize payment for your order."

//         );

//       }

//       // ----------------------------------------------

//       // REDIRECT TO PAYSTACK

//       // ----------------------------------------------

//       window.location.href =

//         data.authorizationUrl;

//     } catch (error) {

//       console.error(

//         "Checkout error:",

//         error

//       );

//       setErrorMessage(

//         error instanceof Error

//           ? error.message

//           : "Something went wrong. Please try again."

//       );

//     } finally {

//       setIsSubmitting(false);

//     }

//   }

//   // --------------------------------------------------

//   // EMPTY CART

//   // --------------------------------------------------

//   if (items.length === 0) {

//     return (

//       <>

//         <Header />

//         <main className="checkout-page">

//           <section className="checkout-empty">

//             <p className="checkout-eyebrow">

//               CHECKOUT

//             </p>

//             <h1>

//               Your cart is empty

//             </h1>

//             <p>

//               Add some products to your

//               cart before proceeding to

//               checkout.

//             </p>

//             <a

//               href="/shop"

//               className="checkout-continue-button"

//             >

//               Continue Shopping

//               <span>→</span>

//             </a>

//           </section>

//         </main>

//         <Footer />

//       </>

//     );

//   }

//   // --------------------------------------------------

//   // CHECKOUT PAGE

//   // --------------------------------------------------

//   return (

//     <>

//       <Header />

//       <main className="checkout-page">

//         {/* HEADER */}

//         <section className="checkout-header">

//           <p className="checkout-eyebrow">

//             DC CLOTHINGS

//           </p>

//           <h1>

//             Checkout

//           </h1>

//           <p>

//             Complete your details below

//             and we'll prepare your order

//             for payment.

//           </p>

//         </section>

//         {/* ERROR MESSAGE */}

//         {errorMessage && (

//           <div

//             className="checkout-error"

//             role="alert"

//           >

//             {errorMessage}

//           </div>

//         )}

//         <section className="checkout-content">

//           {/* CHECKOUT FORM */}

//           <form

//             className="checkout-form"

//             onSubmit={handleSubmit}

//           >

//             {/* CUSTOMER INFORMATION */}

//             <div className="checkout-form-section">

//               <div className="checkout-section-heading">

//                 <span>01</span>

//                 <div>

//                   <h2>

//                     Customer Information

//                   </h2>

//                   <p>

//                     Tell us who we're preparing

//                     this order for.

//                   </p>

//                 </div>

//               </div>

//               <div className="checkout-fields">

//                 <div className="checkout-field checkout-field-full">

//                   <label htmlFor="fullName">

//                     Full Name

//                   </label>

//                   <input

//                     id="fullName"

//                     name="fullName"

//                     type="text"

//                     placeholder="Enter your full name"

//                     value={

//                       formData.fullName

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//                 <div className="checkout-field">

//                   <label htmlFor="email">

//                     Email Address

//                   </label>

//                   <input

//                     id="email"

//                     name="email"

//                     type="email"

//                     placeholder="you@example.com"

//                     value={

//                       formData.email

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//                 <div className="checkout-field">

//                   <label htmlFor="phone">

//                     Phone Number

//                   </label>

//                   <input

//                     id="phone"

//                     name="phone"

//                     type="tel"

//                     placeholder="+234 800 000 0000"

//                     value={

//                       formData.phone

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//               </div>

//             </div>

//             {/* DELIVERY INFORMATION */}

//             <div className="checkout-form-section">

//               <div className="checkout-section-heading">

//                 <span>02</span>

//                 <div>

//                   <h2>

//                     Delivery Information

//                   </h2>

//                   <p>

//                     Where should we deliver

//                     your order?

//                   </p>

//                 </div>

//               </div>

//               <div className="checkout-fields">

//                 <div className="checkout-field">

//                   <label htmlFor="country">

//                     Country

//                   </label>

//                   <select

//                     id="country"

//                     name="country"

//                     value={

//                       formData.country

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   >

//                     <option value="Nigeria">

//                       Nigeria

//                     </option>

//                     <option value="United Kingdom">

//                       United Kingdom

//                     </option>

//                     <option value="United States">

//                       United States

//                     </option>

//                     <option value="Canada">

//                       Canada

//                     </option>

//                     <option value="Ghana">

//                       Ghana

//                     </option>

//                     <option value="Other">

//                       Other

//                     </option>

//                   </select>

//                 </div>

//                 <div className="checkout-field">

//                   <label htmlFor="state">

//                     State / Region

//                   </label>

//                   <input

//                     id="state"

//                     name="state"

//                     type="text"

//                     placeholder="e.g. Lagos"

//                     value={

//                       formData.state

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//                 <div className="checkout-field">

//                   <label htmlFor="city">

//                     City

//                   </label>

//                   <input

//                     id="city"

//                     name="city"

//                     type="text"

//                     placeholder="e.g. Ikeja"

//                     value={

//                       formData.city

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//                 <div className="checkout-field checkout-field-full">

//                   <label htmlFor="address">

//                     Full Delivery Address

//                   </label>

//                   <textarea

//                     id="address"

//                     name="address"

//                     rows={4}

//                     placeholder="Enter your complete delivery address"

//                     value={

//                       formData.address

//                     }

//                     onChange={

//                       handleChange

//                     }

//                     required

//                   />

//                 </div>

//               </div>

//             </div>

//             {/* DELIVERY ESTIMATES */}

//             <section

//               aria-labelledby="delivery-estimates-heading"

//               style={{

//                 margin: "0 0 24px",

//                 padding: "20px",

//                 border: "1px solid #dedbd5",

//                 borderRadius: "12px",

//                 background: "#faf9f6",

//               }}

//             >

//               <h2

//                 id="delivery-estimates-heading"

//                 style={{ margin: "0 0 8px", fontSize: "18px" }}

//               >

//                 Delivery Estimates

//               </h2>

//               <p style={{ margin: "0 0 16px", color: "#666" }}>

//                 Estimated delivery times for your destination:

//               </p>

//               <ul

//                 style={{

//                   display: "grid",

//                   gap: "12px",

//                   listStyle: "none",

//                   margin: 0,

//                   padding: 0,

//                 }}

//               >

//                 <li>

//                   <strong>Within Ibadan:</strong> Delivery within 24 hours.

//                 </li>

//                 <li>

//                   <strong>Within Nigeria:</strong> Delivery within 24–72 hours.

//                 </li>

//                 <li>

//                   <strong>Outside Nigeria:</strong> Delivery within 5–21 days.

//                 </li>

//               </ul>

//               <p style={{ margin: "16px 0 0", fontSize: "13px", color: "#666" }}>

//                 Delivery times are estimates and may vary by destination.

//               </p>

//             </section>

//             <div
//              className="checkout-pickup-note"
//              style={{
//                margin: "0 0 24px",
//                padding: "12px 16px",
//                borderLeft: "3px solid #b9a98a",
//                background: "#faf9f6",
//                borderRadius: "0 8px 8px 0",
//                color: "#666",
//                fontSize: "13px",
//                lineHeight: 1.6,
//              }}
//            >
//              <strong
//                style={{
//                  display: "block",
//                  marginBottom: "4px",
//                  color: "#222",
//                  fontSize: "14px",
//                }}
//              >
//                Store Pickup
//              </strong>
//              <p style={{ margin: 0 }}>
//                Prefer to collect your order? Store pickup is available between
//                10:00 AM and 5:00 PM. Please contact us before visiting to arrange
//                your pickup.
//              </p>
//            </div>

//            {/* SUBMIT */}

//             <button

//               type="submit"

//               className="checkout-submit-button"

//               disabled={isSubmitting}

//             >

//               {isSubmitting

//                 ? "Creating Order..."

//                 : "Continue to Payment"}

//               <span>→</span>

//             </button>

//           </form>

//           {/* ORDER SUMMARY */}

//           <aside className="checkout-summary">

//             <div className="checkout-summary-inner">

//               <p className="checkout-summary-eyebrow">

//                 YOUR ORDER

//               </p>

//               <h2>

//                 Order Summary

//               </h2>

//               <div className="checkout-items">

//                 {items.map((item) => (

//                   <div

//                     key={

//                       item.cartItemId

//                     }

//                     className="checkout-item"

//                   >

//                     <div className="checkout-item-image">

//                       {item.imageUrl ? (

//                         <img

//                           src={

//                             item.imageUrl

//                           }

//                           alt={

//                             item.name

//                           }

//                         />

//                       ) : (

//                         <div>

//                           No image

//                         </div>

//                       )}

//                     </div>

//                     <div className="checkout-item-details">

//                       <h3>

//                         {item.name}

//                       </h3>

//                       <p>

//                         {item.color} /{" "}

//                         {item.size}

//                       </p>

//                       <p>

//                         Qty:{" "}

//                         {item.quantity}

//                       </p>

//                     </div>

//                     <strong>

//                       ₦

//                       {(

//                         Number(

//                           item.price

//                         ) *

//                         item.quantity

//                       ).toLocaleString()}

//                     </strong>

//                   </div>

//                 ))}

//               </div>

//               <div className="checkout-summary-lines">

//                 <div>

//                   <span>

//                     Subtotal

//                   </span>

//                   <strong>

//                     ₦

//                     {subtotal.toLocaleString(

//                       "en-NG"

//                     )}

//                   </strong>

//                 </div>

//                 <div>

//                   <span>

//                     Delivery

//                   </span>

//                   <strong>

//                     ₦

//                     {deliveryFee.toLocaleString(

//                       "en-NG"

//                     )}

//                   </strong>

//                 </div>

//               </div>

//               <div className="checkout-total">

//                 <span>

//                   Total

//                 </span>

//                 <strong>

//                   ₦

//                   {total.toLocaleString(

//                     "en-NG"

//                   )}

//                 </strong>

//               </div>

//               <div className="checkout-security">

//                 <span>

//                   ✓

//                 </span>

//                 <p>

//                   Secure payment will be

//                   processed through our

//                   trusted payment provider.

//                 </p>

//               </div>

//             </div>

//           </aside>

//         </section>

//       </main>

//       <Footer />

//     </>

//   );

// }


"use client";

import { FormEvent, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    fulfillmentMethod,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // PRODUCT TOTAL - DELIVERY CHARGES ARE HANDLED SEPARATELY
  const total = subtotal;

  // HANDLE FORM CHANGES
  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // SUBMIT CHECKOUT
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: items,
          customer: formData,
          fulfillmentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create your order."
        );
      }

      if (!data.authorizationUrl) {
        throw new Error(
          "Unable to initialize payment for your order."
        );
      }

      // REDIRECT TO PAYSTACK
      window.location.href = data.authorizationUrl;

    } catch (error) {
      console.error("Checkout error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // EMPTY CART
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
              Add some products to your cart before proceeding
              to checkout.
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

  // CHECKOUT PAGE
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
            Complete your details below and we'll prepare
            your order for payment.
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
                    Tell us who we're preparing this order for.
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
                    value={formData.fullName}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
            </div>

            {/* DELIVERY INFORMATION - DELIVERY ONLY */}

            {fulfillmentMethod === "delivery" && (
              <div className="checkout-form-section">

                <div className="checkout-section-heading">
                  <span>02</span>

                  <div>
                    <h2>
                      Delivery Information
                    </h2>

                    <p>
                      Where should we deliver your order?
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
                      value={formData.country}
                      onChange={handleChange}
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
                      value={formData.state}
                      onChange={handleChange}
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
                      value={formData.city}
                      onChange={handleChange}
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
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>
              </div>
            )}

            {/* FULFILMENT INFORMATION */}

            <section
              className="checkout-pickup-note"
              style={{
                margin: "0 0 24px",
                padding: "16px 20px",
                borderLeft: "3px solid #b9a98a",
                background: "#faf9f6",
                borderRadius: "0 8px 8px 0",
                color: "#666",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >

              {fulfillmentMethod === "delivery" ? (
                <>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#222",
                      fontSize: "15px",
                    }}
                  >
                    Delivery Arrangements
                  </strong>

                  <p style={{ margin: 0 }}>
                    Our sales representative will contact you
                    within 24 hours to confirm your delivery
                    arrangements and applicable delivery charge.
                    Delivery charges are not included in your
                    online payment.
                  </p>
                </>
              ) : (
                <>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#222",
                      fontSize: "15px",
                    }}
                  >
                    Store Pickup
                  </strong>

                  <p style={{ margin: 0 }}>
                    Your order will be available for collection
                    at Challenge, Ibadan, Oyo State, Nigeria.
                    Pickup is available between 10:00 AM and
                    5:00 PM. Please contact us before visiting
                    to arrange your collection.
                  </p>
                </>
              )}

            </section>

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

              {/* FULFILMENT METHOD */}

              <div
                style={{
                  margin: "0 0 20px",
                  padding: "12px 14px",
                  background: "#faf9f6",
                  border: "1px solid #dedbd5",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#777",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                  }}
                >
                  FULFILMENT METHOD
                </span>

                <strong
                  style={{
                    color: "#321b14",
                    fontSize: "14px",
                  }}
                >
                  {fulfillmentMethod === "pickup"
                    ? "Store Pickup"
                    : "Delivery"}
                </strong>
              </div>

              {/* ITEMS */}

              <div className="checkout-items">

                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="checkout-item"
                  >

                    <div className="checkout-item-image">
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

                    <div className="checkout-item-details">
                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.color} / {item.size}
                      </p>

                      <p>
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <strong>
                      ₦
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString("en-NG")}
                    </strong>

                  </div>
                ))}

              </div>

              {/* TOTALS */}

              <div className="checkout-summary-lines">

                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₦
                    {subtotal.toLocaleString("en-NG")}
                  </strong>
                </div>

              </div>

              <div className="checkout-total">
                <span>
                  Total
                </span>

                <strong>
                  ₦
                  {total.toLocaleString("en-NG")}
                </strong>
              </div>

              {/* DELIVERY PAYMENT NOTICE */}

              {fulfillmentMethod === "delivery" && (
                <p
                  style={{
                    margin: "12px 0",
                    color: "#777",
                    fontSize: "12px",
                    lineHeight: 1.6,
                  }}
                >
                  Delivery charges will be communicated
                  separately by our sales representative.
                </p>
              )}

              {/* PAYMENT SECURITY */}

              <div className="checkout-security">
                <span>
                  ✓
                </span>

                <p>
                  Secure payment will be processed through
                  our trusted payment provider.
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
