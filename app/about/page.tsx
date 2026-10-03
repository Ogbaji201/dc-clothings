import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">

        {/* HERO */}

        <section className="about-hero">

          <div className="about-hero-content">

            <p className="about-eyebrow">
              DC CLOTHINGS / OUR STORY
            </p>

            <h1>
              Made in
              <br />
              Nigeria.
            </h1>

            <p className="about-hero-introduction">
              Clothing created with purpose,
              crafted with care and designed
              to last beyond the moment.
            </p>

          </div>

          <div className="about-hero-side">

            <span>
              NIGERIAN MADE
            </span>

            <span>
              EST. DC CLOTHINGS
            </span>

          </div>

        </section>

        {/* IMAGE + STORY */}

        <section className="about-story">

          <div className="about-story-image">

            <img
              src="https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/family.jpeg"
              alt="DCClothings collection"
            />

          </div>

          <div className="about-story-content">

            <p className="about-section-eyebrow">
              OUR STORY
            </p>

            <h2>
              Clothing that
              <br />
              feels like you.
            </h2>

            <p>
              DCClothings is a Nigerian clothing
              brand built around a simple idea:
              everyday clothing should feel good,
              look good and stand the test of time.
            </p>

            <p>
              We create high-quality casual outfits
              using locally sourced fabrics and
              thoughtful tailoring. Every piece is
              carefully drafted and well tailored
              with comfort, varieties and affordability in mind.
            </p>

            <p>
              From individual customers to
              businesses, organisations and bulk
              orders, our aim remains the same —
              to create clothing that people are
              proud to wear.
            </p>

          </div>

        </section>

        {/* NIGERIAN MADE */}

        <section className="about-nigeria">

          <div className="about-nigeria-content">

            <p className="about-section-eyebrow">
              PROUDLY NIGERIAN
            </p>

            <h2>
              Local roots.
              <br />
              Global outlook.
            </h2>

            <p>
              We believe Nigerian creativity,
              craftsmanship and production can
              create clothing that belongs anywhere
              in the world.
            </p>

            <p>
              Our collections are made in Nigeria,
              combining locally sourced materials
              with considered design and careful
              tailoring.
            </p>

          </div>

          <div className="about-nigeria-image">

            <img
              src="https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/productRange.jpeg"
              alt="DCClothings clothing collection"
            />

          </div>

        </section>

        {/* VALUES */}

        <section className="about-values">

          <div className="about-values-header">

            <p className="about-section-eyebrow">
              WHAT WE STAND FOR
            </p>

            <h2>
              The DCClothings
              <br />
              Standard
            </h2>

          </div>

          <div className="about-values-grid">

            <div className="about-value">

              <span>
                01
              </span>

              <h3>
                Quality
              </h3>

              <p>
                We pay attention to the details
                that make clothing feel better,
                fit better and last longer.
              </p>

            </div>

            <div className="about-value">

              <span>
                02
              </span>

              <h3>
                Comfort
              </h3>

              <p>
                Clothing should move with you.
                Comfort is considered from fabric
                selection through to the finished
                garment.
              </p>

            </div>

            <div className="about-value">

              <span>
                03
              </span>

              <h3>
                Timelessness
              </h3>

              <p>
                We create pieces that aren't
                dependent on short-lived trends.
                Style should remain relevant.
              </p>

            </div>

            <div className="about-value">

              <span>
                04
              </span>

              <h3>
                Individuality
              </h3>

              <p>
                Our clothing is designed to give
                people room to express their own
                identity and personal style.
              </p>

            </div>

          </div>

        </section>

        {/* QUALITY STATEMENT */}

        <section className="about-quality">

          <img
            src="https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/catalogue.jpeg"
            alt="DCClothings quality"
          />

          <div className="about-quality-overlay" />

          <div className="about-quality-content">

            <p className="about-section-eyebrow">
              THE PROMISE
            </p>

            <h2>
              Soft.
              <br />
              Bold.
              <br />
              Timeless.
            </h2>

            <p>
              Designed in Nigeria.
              <br />
              Made for everywhere.
            </p>

            <a
              href="/collections"
              className="about-quality-button"
            >
              Explore the Collection
              <span>→</span>
            </a>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}