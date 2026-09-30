import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductFilters from "../components/ProductFilters";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(`
          id,
          category_id,
          name,
          slug,
          base_price,
          stock_quantity,
          is_active,
          is_featured,
          created_at
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

  if (productsError) {
    console.error("Error loading products:", productsError);
  }

  if (categoriesError) {
    console.error("Error loading categories:", categoriesError);
  }

  const categoryMap = new Map(
    (categories ?? []).map((category) => [
      category.id,
      category.name,
    ])
  );

  const formattedProducts = (products ?? []).map((product) => ({
    ...product,
    category_name:
      categoryMap.get(product.category_id) ?? "Uncategorised",
  }));

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>

          <p className="admin-page-introduction">
            Manage the products available in the DCClothings catalogue.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="admin-primary-button"
        >
          Add Product
        </Link>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Product Catalogue</h2>

            <p className="admin-record-count">
              {formattedProducts.length} products
            </p>
          </div>
        </div>

        {productsError || categoriesError ? (
          <div className="admin-error-message">
            Unable to load the product catalogue.
          </div>
        ) : (
          <ProductFilters
            products={formattedProducts}
            categories={categories ?? []}
          />
        )}
      </section>
    </main>
  );
}