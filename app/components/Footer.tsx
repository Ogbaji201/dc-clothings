export default function Footer() {
  return (
    <footer className="site-footer">

      {/* =========================================
          MAIN FOOTER
      ========================================= */}

      <div className="footer-main">

        {/* =====================================
            BRAND
        ===================================== */}

        <div className="footer-brand">

          <a
            href="/"
            className="footer-logo"
          >
            DCClothings
          </a>

          <p className="footer-tagline">
            Nigerian Made. Designed to Last.
          </p>

          <p className="footer-description">
            High quality, comfortable and timeless
            clothing made in Nigeria for customers
            around the world.
          </p>

        </div>


        {/* =====================================
            NAVIGATION
        ===================================== */}

        <div className="footer-navigation">

          {/* Explore */}

          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <a href="/">
              Home
            </a>

            <a href="/shop">
              Shop
            </a>

            <a href="/collections">
              Collections
            </a>

          </div>


          {/* Company */}

          <div className="footer-column">

            <h3>
              Company
            </h3>

            <a href="/about">
              About
            </a>

            <a href="/contact">
              Contact
            </a>

            <a href="/faq">
              FAQ
            </a>

          </div>


          {/* Services */}

          <div className="footer-column">

            <h3>
              Services
            </h3>

            <a href="/bulk-orders">
              Bulk Orders
            </a>

            <a href="/custom-orders">
              Custom Orders
            </a>

            <a href="/delivery">
              Delivery
            </a>

          </div>

        </div>


        {/* =====================================
            SOCIAL MEDIA
        ===================================== */}

        <div className="footer-social">

          <h3>
            Follow Us
          </h3>

          <div className="social-links">

            {/* Instagram */}

            <a
              href="https://www.instagram.com/shopdcclothings"
              aria-label="Instagram"
              className="social-icon"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >

                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />

              </svg>

            </a>


            {/* Facebook */}

            <a
              href="https://www.facebook.com/Shopdcclothings"
              aria-label="Facebook"
              className="social-icon"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >

                <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.7.3-1 1-1z" />

              </svg>

            </a>


            {/* TikTok */}

            <a
              href="https://www.tiktok.com/@shopdcclothings"
              aria-label="TikTok"
              className="social-icon"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >

                <path d="M19.6 7.1a5.9 5.9 0 0 1-3.7-1.3v8.1a5.1 5.1 0 1 1-4.4-5v2.8a2.4 2.4 0 1 0 1.6 2.2V2h2.8c.2 2.1 1.5 3.7 3.7 4v1.1z" />

              </svg>

            </a>


            {/* X */}

            <a
              href="https://twitter.com/Shopdcclothings"
              aria-label="X"
              className="social-icon"
            >

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >

                <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.2 22H3.1l7.3-8.4L2.8 2h6.4l4.5 5.9zm-1.1 17.7h1.7L8.2 4.2H6.4z" />

              </svg>

            </a>

          </div>

        </div>

      </div>


      {/* =========================================
          FOOTER BOTTOM
      ========================================= */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} DCClothings.
          All rights reserved.
        </p>

        <div className="footer-legal">

          <a href="/privacy">
            Privacy Policy
          </a>

          <a href="/terms">
            Terms & Conditions
          </a>

        </div>

        <p className="footer-motto">
          Style Today. A Brighter Tomorrow. 
          <br/>
          DCclothings is a sub brand of Dammyscreation Global Limited
        </p>

      </div>

    </footer>
  );
}