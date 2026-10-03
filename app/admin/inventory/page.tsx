import { createAdminClient } from "@/lib/supabase/admin";
import InventoryFilters from "../components/InventoryFilters";

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  stock_quantity: number;
  inventory_mode: "product" | "variant";
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
};

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();

  const [
    { data: products, error: productsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        base_price,
        stock_quantity,
        inventory_mode,
        is_active,
        is_featured,
        category_id
      `)
      .order("name", { ascending: true }),

    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (productsError) {
    console.error(
      "Error loading inventory:",
      productsError
    );
  }

  if (categoriesError) {
    console.error(
      "Error loading categories:",
      categoriesError
    );
  }

  const productList = (products ?? []) as Product[];
  const categoryList = (categories ?? []) as Category[];

  const totalProducts = productList.length;

  const totalStock = productList.reduce(
    (total, product) =>
      total + (product.stock_quantity ?? 0),
    0
  );

  const outOfStockCount = productList.filter(
    (product) =>
      (product.stock_quantity ?? 0) <= 0
  ).length;

  const lowStockCount = productList.filter(
    (product) => {
      const stock = product.stock_quantity ?? 0;

      return stock > 0 && stock <= 5;
    }
  ).length;

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            Inventory
          </p>

          <h1>Inventory</h1>

          <p className="admin-page-introduction">
            View and manage the stock levels of products
            currently available in the DCClothings
            catalogue.
          </p>
        </div>
      </div>


      {/* =========================================
          INVENTORY
      ========================================= */}

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-eyebrow">
              Product Inventory
            </p>

            <h2>Current Stock</h2>
          </div>
        </div>

        <InventoryFilters
          products={productList}
          categories={categoryList}
        />
      </section>
    </main>
  );
}