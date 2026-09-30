"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const faqs = [
  {
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Browse our collection, select the product you want, choose your preferred colour and size, then add it to your cart. When you are ready, proceed to checkout and complete your order details.",
  },
  {
    category: "Orders",
    question: "Can I order more than one product?",
    answer:
      "Yes. You can add multiple products to your cart before proceeding to checkout. You can also purchase different sizes and colours of the same product.",
  },
  {
    category: "Products",
    question: "What sizes are available?",
    answer:
      "Our current collection is available in M, L, XL and XXL. Size availability can vary between products, so please check the available options on each product page before ordering.",
  },
  {
    category: "Products",
    question: "What colours are available?",
    answer:
      "Available colours vary by product. The available colours for each item are displayed on its individual product page.",
  },
  {
    category: "Products",
    question: "Are your clothes made in Nigeria?",
    answer:
      "Yes. DCClothings is proudly Nigerian made. We use locally sourced fabrics and work with careful tailoring and production to create comfortable, high-quality clothing.",
  },
  {
    category: "Delivery",
    question: "Do you deliver across Nigeria?",
    answer:
      "Yes. We offer delivery within Nigeria. Delivery arrangements and charges may vary depending on your location and order.",
  },
  {
    category: "Delivery",
    question: "Do you ship internationally?",
    answer:
      "Yes. DCClothings is designed to serve customers beyond Nigeria. International delivery arrangements may vary depending on the destination and order.",
  },
  {
    category: "Delivery",
    question: "How much does delivery cost?",
    answer:
      "Delivery charges depend on the destination and order. The applicable delivery cost will be confirmed as part of the order process.",
  },
  {
    category: "Bulk & Corporate",
    question: "Do you accept bulk orders?",
    answer:
      "Yes. We accept bulk and corporate orders for businesses, organisations, events and other groups. Visit our Bulk Orders page to learn more and submit an enquiry.",
  },
  {
    category: "Bulk & Corporate",
    question: "Can I request a custom order?",
    answer:
      "Yes. We can discuss custom clothing requirements depending on the project. Visit our Custom Orders page and tell us what you have in mind.",
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "Payment options will be presented during checkout once the payment system is fully enabled.",
  },
  {
    category: "Support",
    question: "How can I contact DCClothings?",
    answer:
      "You can contact us through the Contact page for questions about products, orders, bulk purchases, custom orders or other enquiries.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleFAQ(index: number) {
    setOpenIndex(currentIndex =>
      currentIndex === index ? null : index
    );
  }

  return (
    <>
      <Header />

      <main className="faq-page">

        {/* HERO */}

        <section className="faq-hero">

          <div className="faq-hero-content">

            <p className="faq-eyebrow">
              DC CLOTHINGS / FAQ
            </p>

            <h1>
              Questions.
              <br />
              Answers.
            </h1>

            <p className="faq-hero-introduction">
              Everything you need to know about our
              products, orders, delivery and services.
            </p>

          </div>

          <div className="faq-hero-side">

            <span>
              NIGERIAN MADE
            </span>

            <span>
              DESIGNED TO LAST
            </span>

          </div>

        </section>


        {/* FAQ CONTENT */}

        <section className="faq-content">

          <div className="faq-content-introduction">

            <p className="faq-section-eyebrow">
              FREQUENTLY ASKED
            </p>

            <h2>
              Find what
              <br />
              you need.
            </h2>

          </div>


          <div className="faq-list">

            {faqs.map((faq, index) => {

              const isOpen = openIndex === index;

              return (
                <div
                  className={`faq-item ${
                    isOpen ? "faq-item-open" : ""
                  }`}
                  key={faq.question}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                  >

                    <span className="faq-question-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="faq-question-content">

                      <small>
                        {faq.category}
                      </small>

                      <strong>
                        {faq.question}
                      </strong>

                    </span>

                    <span className="faq-icon">
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>


                  <div
                    className={`faq-answer ${
                      isOpen ? "faq-answer-open" : ""
                    }`}
                  >

                    <p>
                      {faq.answer}
                    </p>

                  </div>

                </div>
              );

            })}

          </div>

        </section>


        {/* CTA */}

        <section className="faq-cta">

          <div className="faq-cta-content">

            <p className="faq-section-eyebrow">
              STILL HAVE QUESTIONS?
            </p>

            <h2>
              We're here
              <br />
              to help.
            </h2>

            <p>
              Can't find the answer you're looking for?
              Get in touch with our team and we'll be
              happy to help.
            </p>

            <a
              href="/contact"
              className="faq-cta-button"
            >
              Contact Us
              <span>→</span>
            </a>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}