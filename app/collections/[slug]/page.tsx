import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import Footer from "../../components/Footer";

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // GET CATEGORY
  // --------------------------------------------------

  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // --------------------------------------------------
  // GET PRODUCTS IN THIS CATEGORY
  // --------------------------------------------------

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
      product_images (
        image_url,
        alt_text,
        is_primary
      )
    `)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (productsError) {
    console.error(
      "Collection products loading error:",
      productsError
    );
  }

  const productList = products ?? [];

  return (
    <>
      <Header />

      <main className="collection-page">

        {/* BREADCRUMB */}

        <div className="collection-breadcrumb">
          <a href="/">Home</a>

          <span>/</span>

          <a href="/collections">
            Collections
          </a>

          <span>/</span>

          <span>
            {category.name}
          </span>
        </div>

        {/* COLLECTION HERO */}

        <section className="collection-hero">

          <div className="collection-hero-content">

            <p className="collection-eyebrow">
              DC CLOTHINGS / COLLECTION
            </p>

            <h1>
              {category.name}
            </h1>

            <p className="collection-description">
              {category.description ||
                "Explore the collection from DCClothings — Nigerian made, designed to last."}
            </p>

          </div>

          <div className="collection-hero-meta">

            <span>
              {productList.length}{" "}
              {productList.length === 1
                ? "Product"
                : "Products"}
            </span>

            <a href="/collections">
              All Collections
              <span>→</span>
            </a>

          </div>

        </section>

        {/* PRODUCTS */}

        <section className="collection-products-section">

          <div className="collection-products-header">

            <div>
              <p className="collection-products-eyebrow">
                EXPLORE
              </p>

              <h2>
                {category.name}
              </h2>
            </div>

            <p>
              {productList.length}{" "}
              {productList.length === 1
                ? "Product"
                : "Products"}
            </p>

          </div>

          {productList.length > 0 ? (

            <div className="collection-product-grid">

              {productList.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>

          ) : (

            <div className="collection-empty">

              <p>
                There are currently no
                products in this collection.
              </p>

              <a href="/shop">
                Continue Shopping
                <span>→</span>
              </a>

            </div>

          )}

        </section>

        {/* COLLECTION NAVIGATION */}

        <section className="collection-bottom">

          <a
            href="/collections"
            className="collection-bottom-link"
          >
            <span>←</span>

            <div>
              <small>
                BACK TO
              </small>

              <strong>
                All Collections
              </strong>
            </div>
          </a>

          <a
            href="/shop"
            className="collection-bottom-link collection-bottom-link-right"
          >
            <div>
              <small>
                DISCOVER
              </small>

              <strong>
                Shop Everything
              </strong>
            </div>

            <span>→</span>
          </a>

        </section>

      </main>

      <Footer />
    </>
  );
}