type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
};

const temporaryImages: Record<string, string> = {
  "t-shirts-tops":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/productRange.jpeg",

  "collar-shirts":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/catalogue.jpeg",

  "sets":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/family.jpeg",
};

const categoryDescriptions: Record<string, string> = {
  "t-shirts-tops": "Everyday essentials",
  "collar-shirts": "Smart & versatile",
  "sets": "Comfort, styled together",
};

export default function CategorySection({
  categories,
}: {
  categories: Category[];
}) {
  const featuredSlugs = [
    "t-shirts-tops",
    "collar-shirts",
    "sets",
  ];

  const featuredCategories = featuredSlugs
    .map((slug) =>
      categories.find((category) => category.slug === slug)
    )
    .filter(Boolean) as Category[];

  return (
    <section className="category-section">

      {/* Section Heading */}

      <div className="category-section-header">

        <div>
          <p className="section-eyebrow">
            EXPLORE OUR COLLECTION
          </p>

          <h2>
            Shop by Category
          </h2>
        </div>

        <a
          href="/collections"
          className="category-view-all"
        >
          View All Categories
          <span>→</span>
        </a>

      </div>


      {/* Category Cards */}

      <div className="category-grid">

        {featuredCategories.map((category) => {

          const image =
            category.image_url ||
            temporaryImages[category.slug];

          return (
            <a
              key={category.id}
              href={`/collections/${category.slug}`}
              className="category-card"
            >

              {image && (
                <img
                  src={image}
                  alt={category.name}
                  className="category-image"
                />
              )}

              <div className="category-overlay" />

              <div className="category-content">

                <div>
                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {categoryDescriptions[category.slug] ||
                      category.description ||
                      "Explore the collection"}
                  </p>
                </div>

                <span className="category-arrow">
                  →
                </span>

              </div>

            </a>
          );
        })}


        {/* =====================================
            CUSTOM & BULK ORDERS
        ===================================== */}

        <div className="bulk-category-card">

          <div className="bulk-category-content">

            <p className="bulk-eyebrow">
              FOR INDIVIDUALS,
              <br />
              BUSINESSES & ORGANIZATIONS
            </p>

            <h3>
              Custom
              <br />
              & Bulk Orders
            </h3>

            <p className="bulk-description">
              Need outfits for your team,
              organization or special event?
            </p>

            <a
              href="/contact"
              className="bulk-button"
            >
              Get a Quote
              <span>→</span>
            </a>

          </div>


          {/* Decorative people icon */}

          <div className="bulk-icon">

            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >

              <circle
                cx="32"
                cy="20"
                r="8"
              />

              <path
                d="M17 49c1.5-9 6.5-14 15-14s13.5 5 15 14"
              />

              <circle
                cx="14"
                cy="27"
                r="5"
              />

              <path
                d="M5 49c1-6 4-9 9-9 3 0 5.5 1 7 3"
              />

              <circle
                cx="50"
                cy="27"
                r="5"
              />

              <path
                d="M43 43c1.5-2 4-3 7-3 5 0 8 3 9 9"
              />

            </svg>

          </div>

        </div>

      </div>

    </section>
  );
}