export default function QualitySection() {
  return (
    <section className="quality-section">

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}

      <img
        src="https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/catalogue.jpeg"
        alt="DCClothings quality and craftsmanship"
        className="quality-image"
      />


      {/* =========================================
          IMAGE OVERLAY
      ========================================= */}

      <div className="quality-overlay" />


      {/* =========================================
          LEFT CONTENT
      ========================================= */}

      <div className="quality-content">

        <p className="quality-eyebrow">
          THE DC CLOTHINGS STANDARD
        </p>

        <h2>
          Quality in
          <br />
          Every Detail
        </h2>

        <p className="quality-description">
          Locally sourced fabrics. Carefully drafted.
          <br />
          Well tailored for you.
        </p>

        <a
          href="/collections"
          className="quality-button"
        >
          Shop the Collection
          <span>→</span>
        </a>

      </div>


      {/* =========================================
          RIGHT EDITORIAL TEXT
      ========================================= */}

      <div className="quality-details">

        <span>
          SOFT
        </span>

        <span>
          BOLD
        </span>

        <span>
          TIMELESS
        </span>

        <span>
          NIGERIAN MADE
        </span>

        <i />

      </div>

    </section>
  );
}