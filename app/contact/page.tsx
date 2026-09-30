"use client";

import { FormEvent, useRef, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    const form = formRef.current;

    if (!form) {
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(form);

    const fullName = formData.get("name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const address = formData.get("address")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const inquiry = formData.get("inquiry")?.toString().trim() || "";
    const subject = formData.get("subject")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          address,
          phone,
          subject: subject || inquiry,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong while sending your message."
        );
      }

      form.reset();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Contact form error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="contact-page">

        {/* HERO */}

        <section className="contact-hero">

          <div className="contact-hero-content">

            <p className="contact-eyebrow">
              DC CLOTHINGS / CONTACT
            </p>

            <h1>
              Let's
              <br />
              Talk.
            </h1>

            <p className="contact-hero-introduction">
              Whether you have a question about an order,
              want to discuss a bulk purchase or simply
              want to know more about DCClothings,
              we'd love to hear from you.
            </p>

          </div>

          <div className="contact-hero-side">

            <span>
              NIGERIAN MADE
            </span>

            <span>
              GLOBAL REACH
            </span>

          </div>

        </section>


        {/* CONTACT AREA */}

        <section className="contact-main">

          {/* CONTACT DETAILS */}

          <div className="contact-details">

            <p className="contact-section-eyebrow">
              GET IN TOUCH
            </p>

            <h2>
              We're here
              <br />
              to help.
            </h2>

            <p className="contact-details-introduction">
              Have a question about our products,
              an existing order or a potential
              collaboration? Send us a message and
              our team will get back to you.
            </p>


            <div className="contact-detail-list">

              <div className="contact-detail">

                <span className="contact-detail-number">
                  01
                </span>

                <div>
                  <h3>Email</h3>

                  <p>
                    Your email address
                  </p>
                </div>

              </div>


              <div className="contact-detail">

                <span className="contact-detail-number">
                  02
                </span>

                <div>
                  <h3>Phone</h3>

                  <p>
                    Your phone number
                  </p>
                </div>

              </div>


              <div className="contact-detail">

                <span className="contact-detail-number">
                  03
                </span>

                <div>
                  <h3>WhatsApp</h3>

                  <p>
                    Chat with our team
                  </p>
                </div>

              </div>

            </div>


            <div className="contact-links">

              <a href="/bulk-orders">
                Bulk & Corporate Orders
                <span>→</span>
              </a>

              <a href="/custom-orders">
                Custom Orders
                <span>→</span>
              </a>

              <a href="/faq">
                Frequently Asked Questions
                <span>→</span>
              </a>

            </div>

          </div>


          {/* CONTACT FORM */}

          <div className="contact-form-wrapper">

            <div className="contact-form-header">

              <p className="contact-section-eyebrow">
                SEND A MESSAGE
              </p>

              <h2>
                How can we
                <br />
                help?
              </h2>

            </div>


            {isSubmitted ? (

              <div className="contact-success">

                <p className="contact-section-eyebrow">
                  MESSAGE RECEIVED
                </p>

                <h2>
                  Thank
                  <br />
                  You.
                </h2>

                <p>
                  Your message has been sent successfully.
                  Our team will get back to you as soon
                  as possible.
                </p>

                <button
                  type="button"
                  className="contact-submit-button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setError("");
                  }}
                >
                  Send Another Message
                  <span>→</span>
                </button>

              </div>

            ) : (

              <form
                ref={formRef}
                className="contact-form"
                onSubmit={handleSubmit}
              >

                {/* NAME + EMAIL */}

                <div className="contact-form-row">

                  <div className="contact-field">

                    <label htmlFor="name">
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                    />

                  </div>


                  <div className="contact-field">

                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />

                  </div>

                </div>


                {/* PHONE + INQUIRY */}

                <div className="contact-form-row">

                  <div className="contact-field">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Your phone number"
                    />

                  </div>


                  <div className="contact-field">

                    <label htmlFor="inquiry">
                      Inquiry Type
                    </label>

                    <select
                      id="inquiry"
                      name="inquiry"
                      defaultValue=""
                      required
                    >

                      <option value="" disabled>
                        Select an option
                      </option>

                      <option value="general">
                        General Enquiry
                      </option>

                      <option value="order">
                        Existing Order
                      </option>

                      <option value="product">
                        Product Enquiry
                      </option>

                      <option value="bulk">
                        Bulk / Corporate Order
                      </option>

                      <option value="custom">
                        Custom Order
                      </option>

                      <option value="collaboration">
                        Collaboration
                      </option>

                    </select>

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="contact-field">

                  <label htmlFor="address">
                    Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Your address"
                  />

                </div>


                {/* SUBJECT */}

                <div className="contact-field">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What would you like to talk about?"
                  />

                </div>


                {/* MESSAGE */}

                <div className="contact-field">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={7}
                    placeholder="Tell us how we can help..."
                    required
                  />

                </div>


                {/* ERROR MESSAGE */}

                {error && (
                  <p className="contact-form-error">
                    {error}
                  </p>
                )}


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <span>→</span>
                </button>

              </form>

            )}

          </div>

        </section>


        {/* BOTTOM CTA */}

        <section className="contact-cta">

          <div className="contact-cta-content">

            <p className="contact-section-eyebrow">
              NEED SOMETHING SPECIFIC?
            </p>

            <h2>
              Let's create
              <br />
              something together.
            </h2>

            <p>
              From individual purchases to corporate,
              bulk and custom orders, we're ready to
              work with you.
            </p>

            <div className="contact-cta-links">

              <a
                href="/collections"
                className="contact-cta-button"
              >
                Explore Collection
                <span>→</span>
              </a>

              <a
                href="/bulk-orders"
                className="contact-cta-secondary"
              >
                Bulk & Corporate Orders
                <span>→</span>
              </a>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}