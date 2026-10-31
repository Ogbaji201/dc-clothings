import { createClient } from "@/lib/supabase/server";
import Header from "../components/Header";
import Footer from "../components/Footer";

const temporaryImages: Record<string, string> = {
  "t-shirts-tops":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/products/dae8ec41-e839-4e26-aa6d-e6dee3108af9/8f6e6293-99c8-42a7-b5ab-409b0c8edd46.png",

  "collar-shirts":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/Premium%20Polo%20Shirt%20Showcase.png",

  "sweatshirts-hoodies":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/products/55176a43-9b58-45ca-a6fd-da50c0559ccd/2eb761a1-c65f-42b1-a490-3f1eb59dbe9c.jpg",

  "sets":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/products/806f919d-e440-4944-9cd7-cb7c5d12666a/a121cf3e-ee75-4e32-b43a-bdc094bf0aba.jpg",

  "bottoms":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/products/b7696e66-a730-4ef2-9155-d5b10101412f/e490c32a-5726-4886-8396-3ccfe621946e.jpg",

  "jackets-outerwear":
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/products/2abfd229-d0b3-4bdc-9af5-aceb037b9df9/b21f96f4-807c-4ab7-a2a5-9f9624bf41a0.jpg",
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