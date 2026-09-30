import { createClient } from "@/lib/supabase/server";
import Header from "../components/Header";
import Footer from "../components/Footer";

const temporaryImages: Record<string, string> = {
  "t-shirts-tops":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/productRange.jpeg",

  "collar-shirts":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/catalogue.jpeg",

  "sweatshirts-hoodies":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/family.jpeg",

  "sets":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/family.jpeg",

  "bottoms":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/productRange.jpeg",

  "jackets-outerwear":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/catalogue.jpeg",
};

const collectionDescriptions: Record<string, string> = {
  "t-shirts-tops":
    "Everyday essentials designed for comfort, simplicity and effortless style.",

  "collar-shirts":
    "Smart, versatile pieces that move easily from casual to refined.",

  "sweatshirts-hoodies":
    "Comfort-focused layers made for relaxed days and cooler moments.",

  "sets":
    "Coordinated pieces designed to make everyday dressing simple.",

  "bottoms":
    "Comfortable, versatile bottoms designed to complete your everyday wardrobe.",

  "jackets-outerwear":
    "Layering pieces that add structure, character and timeless style.",
};

const collectionLabels: Record<string, string> = {
  "t-shirts-tops": "01",
  "collar-shirts": "02",
  "sweatshirts-hoodies": "03",
  "sets": "04",
  "bottoms": "05",
  "jackets-outerwear": "06",
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const {
    data: categories,
    error,
  } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url
    `)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error(
      "Collections loading error:",
      error
    );
  }

  return (
    <>
      <Header />

      <main className="collections-page">

        {/* HERO */}

        <section className="collections-hero">

          <div className="collections-hero-content">

            <p className="collections-eyebrow">
              DC CLOTHINGS
            </p>

            <h1>
              The
              <br />
              Collections
            </h1>

            <p className="collections-introduction">
              Explore clothing made in Nigeria
              with a focus on quality, comfort
              and timeless design.
            </p>

          </div>

          <div className="collections-hero-detail">
            <span>
              NIGERIAN MADE
            </span>

            <span>
              DESIGNED TO LAST
            </span>
          </div>

        </section>

        {/* COLLECTIONS */}

        <section className="collections-section">

          <div className="collections-section-header">

            <div>
              <p className="collections-section-eyebrow">
                EXPLORE
              </p>

              <h2>
                Shop by Category
              </h2>
            </div>

            <p className="collections-count">
              {categories?.length ?? 0} Collections
            </p>

          </div>

          <div className="collections-grid">

            {categories?.map((category, index) => {

              const image =
                category.image_url ||
                temporaryImages[category.slug];

              const description =
                collectionDescriptions[
                  category.slug
                ] ||
                category.description ||
                "Explore the collection.";

              return (
                <a
                  key={category.id}
                  href={`/collections/${category.slug}`}
                  className="collection-card"
                >

                  <div className="collection-image-wrapper">

                    {image ? (
                      <img
                        src={image}
                        alt={category.name}
                        className="collection-image"
                      />
                    ) : (
                      <div className="collection-image-placeholder">
                        DCClothings
                      </div>
                    )}

                    <div className="collection-image-overlay" />

                    <span className="collection-number">
                      {collectionLabels[
                        category.slug
                      ] ||
                        String(index + 1).padStart(
                          2,
                          "0"
                        )}
                    </span>

                    <span className="collection-card-arrow">
                      →
                    </span>

                  </div>

                  <div className="collection-card-information">

                    <div>
                      <h3>
                        {category.name}
                      </h3>

                      <p>
                        {description}
                      </p>
                    </div>

                    <span className="collection-explore">
                      Explore
                      <span>→</span>
                    </span>

                  </div>

                </a>
              );
            })}

          </div>

        </section>

        {/* BRAND STATEMENT */}

        <section className="collections-statement">

          <div className="collections-statement-content">

            <p className="collections-section-eyebrow">
              THE DC CLOTHINGS STANDARD
            </p>

            <h2>
              Made in Nigeria.
              <br />
              Made for everywhere.
            </h2>

            <p>
              From everyday essentials to
              statement pieces, every DCClothings
              collection is created with comfort,
              quality and lasting style in mind.
            </p>

            <a
              href="/about"
              className="collections-statement-button"
            >
              Our Story
              <span>→</span>
            </a>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}