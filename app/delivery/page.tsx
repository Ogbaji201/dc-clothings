"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const deliveryModes = [
  {
    icon: "🏍️",
    title: "Local Delivery",
    description: "Moving your order through the city.",
    location: "CITY",
  },
  {
    icon: "🚚",
    title: "Nationwide Delivery",
    description: "Moving orders across Nigeria.",
    location: "NIGERIA",
  },
  {
    icon: "🚢",
    title: "Sea Freight",
    description: "Taking your order across the water.",
    location: "INTERNATIONAL",
  },
  {
    icon: "✈️",
    title: "Air Freight",
    description: "Connecting Nigeria with the world.",
    location: "WORLDWIDE",
  },
];

export default function DeliveryPage() {
  const [activeDeliveryMode, setActiveDeliveryMode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDeliveryMode((current) =>
        (current + 1) % deliveryModes.length
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentDeliveryMode = deliveryModes[activeDeliveryMode];

  return (
    <>
      <Header />

      <main className="delivery-page">

        {/* =========================================
            HERO
        ========================================= */}

        <section className="delivery-hero">

          <div className="delivery-hero-content">

            <p className="delivery-eyebrow">
              DC CLOTHINGS / DELIVERY
            </p>

            <h1>
              Delivered
              <br />
              to You.
            </h1>

            <p className="delivery-hero-introduction">
              From Nigeria to customers around the world,
              we work to make getting your DCClothings
              order simple and convenient.
            </p>

          </div>

          <div className="delivery-hero-side">

            <span>
              NIGERIA
            </span>

            <span>
              WORLDWIDE
            </span>

          </div>

        </section>


        {/* =========================================
            DELIVERY INTRO
        ========================================= */}

        <section className="delivery-intro">

          <div className="delivery-intro-heading">

            <p className="delivery-section-eyebrow">
              HOW IT WORKS
            </p>

            <h2>
              From our
              <br />
              hands to yours.
            </h2>

          </div>

          <div className="delivery-intro-text">

            <p>
              Once your order has been received and
              confirmed, it is prepared for delivery to
              the address provided during checkout.
            </p>

            <p>
              Delivery arrangements can vary depending
              on your location and the nature of your
              order. Your delivery details will be
              communicated as required.
            </p>

          </div>

        </section>


        {/* =========================================
            DELIVERY STEPS
        ========================================= */}

        <section className="delivery-steps">

          <div className="delivery-step">

            <span>01</span>

            <div>
              <h3>
                Place Your Order
              </h3>

              <p>
                Select your products, choose your
                preferred sizes and colours, and
                complete the checkout process.
              </p>
            </div>

          </div>


          <div className="delivery-step">

            <span>02</span>

            <div>
              <h3>
                Order Preparation
              </h3>

              <p>
                Your order is reviewed and prepared
                before it is handed over for delivery.
              </p>
            </div>

          </div>


          <div className="delivery-step">

            <span>03</span>

            <div>
              <h3>
                Delivery
              </h3>

              <p>
                Your order is sent to the delivery
                address provided during checkout.
              </p>
            </div>

          </div>


          <div className="delivery-step">

            <span>04</span>

            <div>
              <h3>
                Receive Your Order
              </h3>

              <p>
                Your DCClothings pieces arrive ready
                for you to enjoy.
              </p>
            </div>

          </div>

        </section>


        {/* =========================================
            ANIMATED DELIVERY JOURNEY
        ========================================= */}

        <section className="delivery-journey">

          <div className="delivery-journey-header">

            <div>

              <p className="delivery-section-eyebrow">
                YOUR ORDER / ON THE MOVE
              </p>

              <h2>
                From here.
                <br />
                To anywhere.
              </h2>

            </div>

            <div className="delivery-journey-status">

              <span>
                {String(activeDeliveryMode + 1).padStart(2, "0")}
              </span>

              <strong>
                {currentDeliveryMode.location}
              </strong>

            </div>

          </div>


          {/* ANIMATION */}

          <div className="delivery-animation">

            {/* SKY */}

            <div className="delivery-sky">

              <span className="delivery-cloud cloud-one">
                ☁
              </span>

              <span className="delivery-cloud cloud-two">
                ☁
              </span>

              <span className="delivery-cloud cloud-three">
                ☁
              </span>

            </div>


            {/* ENVIRONMENT */}

            <div
              className={`delivery-environment environment-${activeDeliveryMode}`}
            >

              {/* CITY */}

              {activeDeliveryMode === 0 && (
                <>
                  <span className="environment-building building-one" />

                  <span className="environment-building building-two" />

                  <span className="environment-building building-three" />
                </>
              )}


              {/* NIGERIA */}

              {activeDeliveryMode === 1 && (
                <>
                  <span className="environment-tree tree-one">
                    🌳
                  </span>

                  <span className="environment-tree tree-two">
                    🌳
                  </span>

                  <span className="environment-tree tree-three">
                    🌳
                  </span>
                </>
              )}


              {/* WATER */}

              {activeDeliveryMode === 2 && (
                <>
                  <div className="delivery-water">

                    <span />
                    <span />
                    <span />

                  </div>

                  <div className="delivery-ship">
                    🚢
                  </div>
                </>
              )}


              {/* AIR */}

              {activeDeliveryMode === 3 && (
                <>
                  <div className="delivery-runway" />

                  <div className="delivery-plane">
                    ✈️
                  </div>
                </>
              )}

            </div>


            {/* ROAD / GROUND */}

            <div className="delivery-horizon">

              <div className="delivery-road">

                <div className="delivery-road-line" />

                {/* Moving vehicle */}

                <div
                  key={activeDeliveryMode}
                  className="delivery-vehicle"
                >
                  {currentDeliveryMode.icon}
                </div>

              </div>

            </div>

          </div>


          {/* ANIMATION INFORMATION */}

          <div className="delivery-journey-information">

            <div>

              <span className="delivery-journey-number">
                {String(activeDeliveryMode + 1).padStart(2, "0")}
              </span>

              <h3>
                {currentDeliveryMode.title}
              </h3>

            </div>


            <p>
              {currentDeliveryMode.description}
            </p>


            {/* MANUAL CONTROLS */}

            <div className="delivery-journey-progress">

              {deliveryModes.map((mode, index) => (

                <button
                  key={mode.title}
                  type="button"
                  aria-label={`Show ${mode.title}`}
                  className={
                    index === activeDeliveryMode
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveDeliveryMode(index)
                  }
                />

              ))}

            </div>

          </div>

        </section>


        {/* =========================================
            NIGERIA / INTERNATIONAL
        ========================================= */}

        <section className="delivery-regions">

          <div className="delivery-region delivery-region-dark">

            <p className="delivery-section-eyebrow">
              01 / NIGERIA
            </p>

            <h2>
              Nationwide
              <br />
              Delivery.
            </h2>

            <p>
              We deliver to customers across Nigeria.
              Delivery arrangements and charges may
              depend on your location and order.
            </p>

            <div className="delivery-region-note">

              <span>
                DELIVERY
              </span>

              <strong>
                ACROSS NIGERIA
              </strong>

            </div>

          </div>


          <div className="delivery-region delivery-region-light">

            <p className="delivery-section-eyebrow">
              02 / INTERNATIONAL
            </p>

            <h2>
              Made in Nigeria.
              <br />
              Made for Everywhere.
            </h2>

            <p>
              We also serve customers outside Nigeria.
              International delivery arrangements,
              charges and requirements may vary
              depending on the destination.
            </p>

            <div className="delivery-region-note">

              <span>
                REACH
              </span>

              <strong>
                WORLDWIDE
              </strong>

            </div>

          </div>

        </section>


        {/* =========================================
            IMPORTANT INFORMATION
        ========================================= */}

        <section className="delivery-information">

          <div className="delivery-information-heading">

            <p className="delivery-section-eyebrow">
              PLEASE NOTE
            </p>

            <h2>
              Before you
              <br />
              place your order.
            </h2>

          </div>


          <div className="delivery-information-list">

            <div className="delivery-information-item">

              <span>
                01
              </span>

              <div>

                <h3>
                  Check Your Address
                </h3>

                <p>
                  Please provide a complete and accurate
                  delivery address during checkout. This
                  helps us process your order correctly.
                </p>

              </div>

            </div>


            <div className="delivery-information-item">

              <span>
                02
              </span>

              <div>

                <h3>
                  Delivery Charges
                </h3>

                <p>
                  Delivery charges may vary according to
                  your destination and order. Applicable
                  delivery costs will be communicated
                  during the order process.
                </p>

              </div>

            </div>


            <div className="delivery-information-item">

              <span>
                03
              </span>

              <div>

                <h3>
                  Delivery Times
                </h3>

                <p>
                  Delivery times can vary depending on
                  location, order type and logistics.
                  We will provide relevant delivery
                  information for your order.
                </p>

              </div>

            </div>


            <div className="delivery-information-item">

              <span>
                04
              </span>

              <div>

                <h3>
                  Bulk & Custom Orders
                </h3>

                <p>
                  Bulk, corporate and custom orders may
                  require different preparation and
                  delivery arrangements. Please contact
                  us before ordering if you have specific
                  requirements.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            CTA
        ========================================= */}

        <section className="delivery-cta">

          <div className="delivery-cta-content">

            <p className="delivery-section-eyebrow">
              NEED HELP?
            </p>

            <h2>
              Have a question
              <br />
              about delivery?
            </h2>

            <p>
              Our team is available to help with
              questions about your order, delivery
              destination or special requirements.
            </p>

            <div className="delivery-cta-links">

              <a
                href="/contact"
                className="delivery-cta-button"
              >
                Contact Us
                <span>→</span>
              </a>

              <a
                href="/faq"
                className="delivery-cta-secondary"
              >
                Read FAQs
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