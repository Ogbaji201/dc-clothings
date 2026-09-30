import { createClient } from "@/lib/supabase/server";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import FeaturedProducts from "./components/FeaturedProducts";
import QualitySection from "./components/QualitySection";
import Footer from "./components/Footer";

export default async function Home() {
  const supabase = await createClient();

  // =========================================
  // LOAD CATEGORIES
  // =========================================

  const {
    data: categories,
    error: categoriesError,
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


  // =========================================
  // LOAD PRODUCTS
  // =========================================

  const {
    data: products,
    error: productsError,
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
      product_variants (
        size,
        color
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


  // =========================================
  // LOG DATABASE ERRORS
  // =========================================

  if (categoriesError) {
    console.error(
      "Category loading error:",
      categoriesError
    );
  }

  if (productsError) {
    console.error(
      "Product loading error:",
      productsError
    );
  }


  // =========================================
  // FEATURED PRODUCTS
  // =========================================

  const featuredProducts =
    products?.filter(
      (product) => product.is_featured
    ) ?? [];


  // =========================================
  // PAGE
  // =========================================

  return (
    <>
      {/* =====================================
          HEADER
      ===================================== */}

      <Header />


      {/* =====================================
          HERO
      ===================================== */}

      <Hero />


      {/* =====================================
          SHOP BY CATEGORY
      ===================================== */}

      <CategorySection
        categories={categories ?? []}
      />


      {/* =====================================
          FEATURED PRODUCTS
      ===================================== */}

      <FeaturedProducts
        products={featuredProducts}
      />


      {/* =====================================
          QUALITY SECTION
      ===================================== */}

      <QualitySection />


      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />

    </>
  );
}