export default function Hero() {
  return (
    <section className="hero">

      {/* =========================================
          LEFT CONTENT
      ========================================= */}

      <div className="hero-content">

        <p className="hero-eyebrow">
          PREMIUM CASUALWEAR
        </p>

        <h1>
          Nigerian Made.
          <br />
          Designed to Last.
        </h1>

        <p className="hero-description">
          High quality, comfortable and stylish outfits
          for every individual. Timeless designs beyond trends.
        </p>

        {/* Buttons */}

        <div className="hero-buttons">

          <a
            href="/shop"
            className="hero-button hero-button-primary"
          >
            Shop Now
            <span>→</span>
          </a>

          <a
            href="/about"
            className="hero-button hero-button-secondary"
          >
            Our Story
          </a>

        </div>


        {/* =========================================
            TRUST FEATURES
        ========================================= */}

        <div className="hero-features">

          {/* Premium Quality */}

          <div className="hero-feature">

            <div className="feature-icon">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

            </div>

            <div>
              <strong>Premium Quality</strong>
              <span>You can trust</span>
            </div>

          </div>


          {/* Nationwide Delivery */}

          <div className="hero-feature">

            <div className="feature-icon">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h11v10H3z" />
                <path d="M14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>

            </div>

            <div>
              <strong>Nationwide Delivery</strong>
              <span>Across Nigeria</span>
            </div>

          </div>


          {/* Bulk & Corporate Orders */}

          <div className="hero-feature">

            <div className="feature-icon">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 8h14l1 12H4L5 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

            </div>

            <div>
              <strong>Bulk & Corporate Orders</strong>
              <span>We've got you covered</span>
            </div>

          </div>


          {/* Global Reach */}

          <div className="hero-feature">

            <div className="feature-icon">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c3 3 4 6 4 9s-1 6-4 9" />
                <path d="M12 3c-3 3-4 6-4 9s1 6 4 9" />
              </svg>

            </div>

            <div>
              <strong>Global Reach</strong>
              <span>Nigerian brand. Worldwide appeal.</span>
            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          RIGHT IMAGE
      ========================================= */}

      <div className="hero-image-wrapper">

        <img
          src="https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/family.jpeg"
          alt="DCClothings premium Nigerian-made clothing"
          className="hero-image"
        />

        <div className="hero-image-message">
          <span>Style</span>
          <span>for Every</span>
          <span>Generation</span>
        </div>

      </div>

    </section>
  );
}