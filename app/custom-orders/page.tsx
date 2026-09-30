"use client";

import { useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CustomOrdersPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    garmentType: "",
    preferredColour: "",
    preferredSize: "",
    quantity: "1",
    description: "",
  });

  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

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

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    setReferenceImage(file);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();

      submissionData.append("fullName", formData.fullName);
      submissionData.append("email", formData.email);
      submissionData.append("phone", formData.phone);
      submissionData.append(
        "garmentType",
        formData.garmentType
      );
      submissionData.append(
        "preferredColour",
        formData.preferredColour
      );
      submissionData.append(
        "preferredSize",
        formData.preferredSize
      );
      submissionData.append(
        "quantity",
        formData.quantity
      );
      submissionData.append(
        "description",
        formData.description
      );

      if (referenceImage) {
        submissionData.append(
          "referenceImage",
          referenceImage
        );
      }

      const response = await fetch(
        "/api/custom-orders",
        {
          method: "POST",
          body: submissionData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Something went wrong while submitting your enquiry."
        );
      }

      // Save the customer's name before clearing the form.
      setSubmittedName(formData.fullName);

      // Clear the form.
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        garmentType: "",
        preferredColour: "",
        preferredSize: "",
        quantity: "1",
        description: "",
      });

      setReferenceImage(null);

      // Clear the file input.
      formRef.current?.reset();

      // Show the success screen.
      setIsSubmitted(true);
    } catch (error) {
      console.error(
        "Custom order submission error:",
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

      <main className="custom-orders-page">

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="custom-hero">
          <div className="custom-hero-content">
            <p className="custom-eyebrow">
              CUSTOM ORDERS
            </p>

            <h1>
              Made
              <br />
              Your Way.
            </h1>

            <p className="custom-hero-description">
              Have something specific in mind?
              Tell us what you envision and let’s
              bring it to life.
            </p>
          </div>

          <div className="custom-hero-side">
            <span>01</span>
            <span>YOUR VISION</span>
          </div>
        </section>


        {/* =====================================================
            INTRO
            ===================================================== */}

        <section className="custom-intro">
          <div className="custom-intro-number">
            01
          </div>

          <div className="custom-intro-content">
            <p className="custom-section-label">
              THE CUSTOM EXPERIENCE
            </p>

            <h2>
              Designed around
              <br />
              what you want.
            </h2>

            <p>
              Every custom order starts with an idea.
              Whether it is a particular garment,
              colour, fit, fabric or complete look,
              tell us what you have in mind and our
              team will review your request.
            </p>

            <p>
              You can also upload a reference image
              to help us understand your vision.
            </p>
          </div>
        </section>


        {/* =====================================================
            CUSTOM OPTIONS
            ===================================================== */}

        <section className="custom-options">
          <div className="custom-options-heading">
            <p className="custom-section-label">
              WHAT CAN BE CUSTOMISED
            </p>

            <h2>
              Your idea.
              <br />
              Your details.
            </h2>
          </div>

          <div className="custom-options-grid">

            <div>
              <span>01</span>

              <h3>Fabric</h3>

              <p>
                Choose the material and feel that
                works for your garment.
              </p>
            </div>

            <div>
              <span>02</span>

              <h3>Colour</h3>

              <p>
                Request a specific colour or
                combination.
              </p>
            </div>

            <div>
              <span>03</span>

              <h3>Style</h3>

              <p>
                Tell us about the shape, design
                or style you have in mind.
              </p>
            </div>

            <div>
              <span>04</span>

              <h3>Sizing</h3>

              <p>
                Let us know your preferred size
                or custom measurements.
              </p>
            </div>

            <div>
              <span>05</span>

              <h3>Branding</h3>

              <p>
                Custom branding can be discussed
                for suitable requests.
              </p>
            </div>

            <div>
              <span>06</span>

              <h3>Quantity</h3>

              <p>
                From individual pieces to larger
                custom requirements.
              </p>
            </div>

          </div>
        </section>


        {/* =====================================================
            STATEMENT
            ===================================================== */}

        <section className="custom-statement">
          <div>
            <p>
              YOUR VISION.
            </p>

            <h2>
              Carefully
              <br />
              made.
            </h2>
          </div>

          <span>
            DC CLOTHINGS
          </span>
        </section>


        {/* =====================================================
            CUSTOM ORDER FORM
            ===================================================== */}

        <section className="custom-form-section">

          <div className="custom-form-intro">

            <p className="custom-section-label">
              START YOUR REQUEST
            </p>

            <h2>
              Tell us what
              <br />
              you have in mind.
            </h2>

            <p>
              Complete the form below and our team
              will review your custom order enquiry.
            </p>

          </div>


          <div className="custom-form-wrapper">

            {!isSubmitted ? (

              <form
                ref={formRef}
                className="custom-order-form"
                onSubmit={handleSubmit}
              >

                {/* FULL NAME */}

                <div className="custom-form-field">
                  <label htmlFor="fullName">
                    Full Name *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>


                {/* EMAIL */}

                <div className="custom-form-field">
                  <label htmlFor="email">
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>


                {/* PHONE */}

                <div className="custom-form-field">
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


                {/* GARMENT TYPE */}

                <div className="custom-form-field">
                  <label htmlFor="garmentType">
                    Garment Type *
                  </label>

                  <select
                    id="garmentType"
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select garment type
                    </option>

                    <option value="shirt">
                      Shirt
                    </option>

                    <option value="t-shirt">
                      T-Shirt
                    </option>

                    <option value="trousers">
                      Trousers
                    </option>

                    <option value="hoodie">
                      Hoodie
                    </option>

                    <option value="jacket">
                      Jacket
                    </option>

                    <option value="two-piece-set">
                      Two-Piece Set
                    </option>

                    <option value="dress">
                      Dress
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>


                {/* COLOUR */}

                <div className="custom-form-field">
                  <label htmlFor="preferredColour">
                    Preferred Colour
                  </label>

                  <input
                    id="preferredColour"
                    name="preferredColour"
                    type="text"
                    value={formData.preferredColour}
                    onChange={handleChange}
                    placeholder="e.g. Black, Navy Blue"
                  />
                </div>


                {/* SIZE */}

                <div className="custom-form-field">
                  <label htmlFor="preferredSize">
                    Preferred Size
                  </label>

                  <select
                    id="preferredSize"
                    name="preferredSize"
                    value={formData.preferredSize}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select size
                    </option>

                    <option value="M">
                      M
                    </option>

                    <option value="L">
                      L
                    </option>

                    <option value="XL">
                      XL
                    </option>

                    <option value="XXL">
                      XXL
                    </option>

                    <option value="custom">
                      Custom Size
                    </option>
                  </select>
                </div>


                {/* QUANTITY */}

                <div className="custom-form-field">
                  <label htmlFor="quantity">
                    Quantity *
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>


                {/* DESCRIPTION */}

                <div className="custom-form-field custom-form-field-full">
                  <label htmlFor="description">
                    Description of Your Custom Idea *
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about the garment you would like us to create..."
                    rows={7}
                    required
                  />
                </div>


                {/* REFERENCE IMAGE */}

                <div className="custom-form-field custom-form-field-full">
                  <label htmlFor="referenceImage">
                    Reference Image
                  </label>

                  <div className="custom-upload">

                    <input
                      id="referenceImage"
                      name="referenceImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />

                    <div className="custom-upload-content">

                      <span className="custom-upload-icon">
                        +
                      </span>

                      <strong>
                        {referenceImage
                          ? referenceImage.name
                          : "Upload a reference image"}
                      </strong>

                      <small>
                        JPG, PNG or WebP
                      </small>

                    </div>

                  </div>
                </div>


                {/* SUBMIT */}

                <div className="custom-form-submit">

                  <button
                    type="submit"
                    className="custom-submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Enquiry"}

                    {!isSubmitting && (
                      <span>→</span>
                    )}
                  </button>

                </div>

              </form>

            ) : (

              /* =================================================
                 SUCCESS MESSAGE
                 ================================================= */

              <div className="custom-order-success">

                <div className="custom-success-mark">
                  ✓
                </div>

                <p className="custom-section-label">
                  ENQUIRY RECEIVED
                </p>

                <h3>
                  Thank you,
                  <br />
                  {submittedName}.
                </h3>

                <p>
                  Your custom order enquiry has been
                  successfully received. Our team will
                  review your requirements and get back
                  to you using the contact details you
                  provided.
                </p>

                <button
                  type="button"
                  className="custom-success-button"
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

        <section className="custom-process">

          <div className="custom-process-heading">

            <p className="custom-section-label">
              WHAT HAPPENS NEXT
            </p>

            <h2>
              From idea
              <br />
              to creation.
            </h2>

          </div>


          <div className="custom-process-list">

            <div>
              <span>01</span>

              <div>
                <h3>
                  We review your enquiry
                </h3>

                <p>
                  Our team reviews your requirements
                  and reference image.
                </p>
              </div>
            </div>


            <div>
              <span>02</span>

              <div>
                <h3>
                  We discuss the details
                </h3>

                <p>
                  We may contact you to clarify
                  your requirements.
                </p>
              </div>
            </div>


            <div>
              <span>03</span>

              <div>
                <h3>
                  We provide the next steps
                </h3>

                <p>
                  Once the requirements are clear,
                  we can discuss pricing and production.
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