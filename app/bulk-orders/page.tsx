"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BulkOrdersPage() {
  const [formData, setFormData] = useState({
    contactPerson: "",
    organisationName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    organisationType: "",
    garmentNeeded: "",
    estimatedQuantity: "1",
    deliveryDeadline: "",
    brandingRequired: "",
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const submissionData = {
        contactPerson: formData.contactPerson,
        organisationName: formData.organisationName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        organisationType: formData.organisationType,
        garmentNeeded: formData.garmentNeeded,
        estimatedQuantity: formData.estimatedQuantity,
        deliveryDeadline: formData.deliveryDeadline,
        brandingRequired:
          formData.brandingRequired === "yes",
        notes: formData.notes,
      };

      const response = await fetch(
        "/api/bulk-orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Something went wrong while submitting your enquiry."
        );
      }

      setSubmittedName(formData.contactPerson);

      setFormData({
        contactPerson: "",
        organisationName: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        organisationType: "",
        garmentNeeded: "",
        estimatedQuantity: "1",
        deliveryDeadline: "",
        brandingRequired: "",
        notes: "",
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error(
        "Bulk order submission error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNewEnquiry() {
    setIsSubmitted(false);
    setSubmittedName("");
  }

  return (
    <>
      <Header />

      <main className="bulk-orders-page">

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="bulk-hero">

          <div className="bulk-hero-content">

            <p className="bulk-eyebrow">
              BULK & CORPORATE ORDERS
            </p>

            <h1>
              Clothing
              <br />
              at Scale.
            </h1>

            <p className="bulk-hero-description">
              Quality Nigerian-made clothing for
              businesses, events, teams and
              organisations.
            </p>

          </div>

          <div className="bulk-hero-side">
            <span>01</span>
            <span>B2B</span>
          </div>

        </section>


        {/* =====================================================
            INTRO
            ===================================================== */}

        <section className="bulk-intro">

          <div className="bulk-intro-number">
            01
          </div>

          <div className="bulk-intro-content">

            <p className="bulk-section-label">
              BUILT FOR MORE
            </p>

            <h2>
              Made for teams,
              <br />
              events & organisations.
            </h2>

            <p>
              Whether you are outfitting a team,
              preparing for an event, supplying
              an organisation or ordering for your
              business, DCClothings can support
              larger clothing requirements.
            </p>

            <p>
              Tell us what you need and our team
              will review your requirements before
              discussing pricing, production and
              delivery.
            </p>

          </div>

        </section>


        {/* =====================================================
            SECTORS
            ===================================================== */}

        <section className="bulk-sectors">

          <div className="bulk-sectors-heading">

            <p className="bulk-section-label">
              WHO WE WORK WITH
            </p>

            <h2>
              One standard.
              <br />
              Different needs.
            </h2>

          </div>

          <div className="bulk-sectors-grid">

            <div>
              <span>01</span>
              <h3>Businesses</h3>
              <p>
                Clothing requirements for
                businesses and corporate teams.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Events</h3>
              <p>
                Coordinated clothing for events,
                conferences and occasions.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Teams</h3>
              <p>
                Consistent clothing for sports,
                creative and professional teams.
              </p>
            </div>

            <div>
              <span>04</span>
              <h3>Organisations</h3>
              <p>
                Larger requirements for schools,
                institutions, associations and more.
              </p>
            </div>

          </div>

        </section>


        {/* =====================================================
            QUALITY STATEMENT
            ===================================================== */}

        <section className="bulk-statement">

          <div>

            <p>
              THE DC CLOTHINGS STANDARD
            </p>

            <h2>
              Quality
              <br />
              at every scale.
            </h2>

          </div>

          <div className="bulk-statement-detail">
            <span>
              NIGERIAN MADE
            </span>

            <span>
              CAREFULLY TAILORED
            </span>

            <span>
              BUILT TO LAST
            </span>
          </div>

        </section>


        {/* =====================================================
            BULK ORDER FORM
            ===================================================== */}

        <section className="bulk-form-section">

          <div className="bulk-form-intro">

            <p className="bulk-section-label">
              START YOUR REQUEST
            </p>

            <h2>
              Let's plan
              <br />
              your order.
            </h2>

            <p>
              Tell us about your organisation and
              what you need. Our team will review
              your enquiry and get back to you.
            </p>

          </div>


          <div className="bulk-form-wrapper">

            {!isSubmitted ? (

              <form
                className="bulk-order-form"
                onSubmit={handleSubmit}
              >

                {/* CONTACT PERSON */}

                <div className="bulk-form-field">
                  <label htmlFor="contactPerson">
                    Contact Person *
                  </label>

                  <input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>


                {/* ORGANISATION */}

                <div className="bulk-form-field">
                  <label htmlFor="organisationName">
                    Organisation Name *
                  </label>

                  <input
                    id="organisationName"
                    name="organisationName"
                    type="text"
                    value={formData.organisationName}
                    onChange={handleChange}
                    placeholder="Company or organisation name"
                    required
                  />
                </div>


                {/* EMAIL */}

                <div className="bulk-form-field">
                  <label htmlFor="email">
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@organisation.com"
                    required
                  />
                </div>


                {/* PHONE */}

                <div className="bulk-form-field">
                  <label htmlFor="phone">
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    required
                  />
                </div>


                {/* COUNTRY */}

                <div className="bulk-form-field">
                  <label htmlFor="country">
                    Country *
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. Nigeria"
                    required
                  />
                </div>


                {/* CITY */}

                <div className="bulk-form-field">
                  <label htmlFor="city">
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Lagos"
                    required
                  />
                </div>


                {/* ORGANISATION TYPE */}

                <div className="bulk-form-field">
                  <label htmlFor="organisationType">
                    Organisation Type *
                  </label>

                  <select
                    id="organisationType"
                    name="organisationType"
                    value={formData.organisationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select organisation type
                    </option>

                    <option value="business">
                      Business
                    </option>

                    <option value="corporate">
                      Corporate Organisation
                    </option>

                    <option value="event">
                      Event / Conference
                    </option>

                    <option value="school">
                      School / Institution
                    </option>

                    <option value="sports-team">
                      Sports Team
                    </option>

                    <option value="church">
                      Church / Religious Organisation
                    </option>

                    <option value="club">
                      Club / Association
                    </option>

                    <option value="fashion-retail">
                      Fashion / Retail
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>


                {/* GARMENT NEEDED */}

                <div className="bulk-form-field">
                  <label htmlFor="garmentNeeded">
                    Garment Needed *
                  </label>

                  <select
                    id="garmentNeeded"
                    name="garmentNeeded"
                    value={formData.garmentNeeded}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select garment
                    </option>

                    <option value="t-shirts">
                      T-Shirts
                    </option>

                    <option value="shirts">
                      Shirts
                    </option>

                    <option value="hoodies">
                      Hoodies
                    </option>

                    <option value="jackets">
                      Jackets
                    </option>

                    <option value="trousers">
                      Trousers
                    </option>

                    <option value="joggers">
                      Joggers
                    </option>

                    <option value="two-piece-sets">
                      Two-Piece Sets
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>


                {/* QUANTITY */}

                <div className="bulk-form-field">
                  <label htmlFor="estimatedQuantity">
                    Estimated Quantity *
                  </label>

                  <input
                    id="estimatedQuantity"
                    name="estimatedQuantity"
                    type="number"
                    min="1"
                    value={formData.estimatedQuantity}
                    onChange={handleChange}
                    required
                  />
                </div>


                {/* DELIVERY DEADLINE */}

                <div className="bulk-form-field">
                  <label htmlFor="deliveryDeadline">
                    Delivery Deadline
                  </label>

                  <input
                    id="deliveryDeadline"
                    name="deliveryDeadline"
                    type="date"
                    value={formData.deliveryDeadline}
                    onChange={handleChange}
                  />
                </div>


                {/* BRANDING */}

                <div className="bulk-form-field">
                  <label htmlFor="brandingRequired">
                    Branding Required?
                  </label>

                  <select
                    id="brandingRequired"
                    name="brandingRequired"
                    value={formData.brandingRequired}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select an option
                    </option>

                    <option value="yes">
                      Yes
                    </option>

                    <option value="no">
                      No
                    </option>
                  </select>
                </div>


                {/* NOTES */}

                <div className="bulk-form-field bulk-form-field-full">

                  <label htmlFor="notes">
                    Additional Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tell us anything else we should know about your order..."
                    rows={7}
                  />

                </div>


                {/* SUBMIT */}

                <div className="bulk-form-submit">

                  <button
                    type="submit"
                    className="bulk-submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Bulk Enquiry"}

                    {!isSubmitting && (
                      <span>→</span>
                    )}
                  </button>

                </div>

              </form>

            ) : (

              /* =================================================
                 SUCCESS STATE
                 ================================================= */

              <div className="bulk-order-success">

                <div className="bulk-success-mark">
                  ✓
                </div>

                <p className="bulk-section-label">
                  ENQUIRY RECEIVED
                </p>

                <h3>
                  Thank you,
                  <br />
                  {submittedName}.
                </h3>

                <p>
                  Your bulk order enquiry has been
                  successfully received. Our team will
                  review your requirements and contact
                  you using the details provided.
                </p>

                <button
                  type="button"
                  className="bulk-success-button"
                  onClick={handleNewEnquiry}
                >
                  Submit Another Enquiry
                  <span>→</span>
                </button>

              </div>

            )}

          </div>

        </section>


        {/* =====================================================
            PROCESS
            ===================================================== */}

        <section className="bulk-process">

          <div className="bulk-process-heading">

            <p className="bulk-section-label">
              HOW IT WORKS
            </p>

            <h2>
              From enquiry
              <br />
              to delivery.
            </h2>

          </div>


          <div className="bulk-process-list">

            <div>
              <span>01</span>

              <div>
                <h3>
                  Tell us what you need
                </h3>

                <p>
                  Submit your requirements,
                  quantities and delivery expectations.
                </p>
              </div>
            </div>


            <div>
              <span>02</span>

              <div>
                <h3>
                  We review your request
                </h3>

                <p>
                  Our team assesses your requirements
                  and gets in touch if further details
                  are needed.
                </p>
              </div>
            </div>


            <div>
              <span>03</span>

              <div>
                <h3>
                  We discuss your order
                </h3>

                <p>
                  We discuss pricing, production,
                  branding and delivery.
                </p>
              </div>
            </div>


            <div>
              <span>04</span>

              <div>
                <h3>
                  Production begins
                </h3>

                <p>
                  Once the order is approved,
                  production and fulfilment can begin.
                </p>
              </div>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}