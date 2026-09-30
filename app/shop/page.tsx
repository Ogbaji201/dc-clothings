import { createClient } from "@/lib/supabase/server";
import Header from "../components/Header";
import ShopProductGrid from "../components/ShopProductGrid";
import Footer from "../components/Footer";

export default async function ShopPage() {
  const supabase = await createClient();

  const {
    data: products,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      base_price,
      stock_quantity,
      is_featured,
      categories (
        name,
        slug
      ),
      product_images (
        image_url,
        alt_text,
        is_primary
      )
    `)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Shop product loading error:",
      error
    );
  }

  return (
    <>
      <Header />

      <main className="shop-page">

        {/* =================================
            SHOP HERO
        ================================= */}

        <section className="shop-hero">

          <div className="shop-hero-content">

            <p className="shop-eyebrow">
              DC CLOTHINGS
            </p>

            <h1>
              Shop the
              <br />
              Collection
            </h1>

            <p className="shop-introduction">
              Explore our collection of
              premium, comfortable and
              timeless clothing, made in
              Nigeria.
            </p>

          </div>

        </section>

        {/* =================================
            PRODUCTS
        ================================= */}

        <section className="shop-products-section">

          <ShopProductGrid
            products={products ?? []}
          />

        </section>

      </main>

      <Footer />
    </>
  );
}