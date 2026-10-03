import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductEditForm from "../../components/ProductEditForm";
import ProductVariants from "../../components/ProductVariants";
import ProductImages from "../../components/ProductImages";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductDetailsPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const [
    { data: product, error: productError },
    { data: categories, error: categoriesError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        category_id,
        name,
        slug,
        description,
        base_price,
        stock_quantity,
        is_active,
        is_featured
      `)
      .eq("id", id)
      .single(),

    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        size,
        color,
        price,
        stock_quantity,
        is_active
      `)
      .eq("product_id", id)
      .order("color", { ascending: true })
      .order("size", { ascending: true }),

    supabase
      .from("product_images")
      .select(`
        id,
        product_id,
        image_url,
        alt_text,
        display_order,
        is_primary
      `)
      .eq("product_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (productError) {
    console.error(
      "Error loading product:",
      productError
    );
  }

  if (categoriesError) {
    console.error(
      "Error loading categories:",
      categoriesError
    );
  }

  if (variantsError) {
    console.error(
      "Error loading variants:",
      JSON.stringify(variantsError, null, 2)
    );
  }

  if (imagesError) {
    console.error(
      "Error loading product images:",
      imagesError
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/products"
            className="admin-back-link"
          >
            ← Back to Products
          </Link>

          <h1>{product.name}</h1>

          <p className="admin-page-introduction">
            Manage product information, catalogue settings,
            variants and images.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <ProductEditForm
          product={product}
          categories={categories ?? []}
        />
      </section>

      <ProductVariants
        productId={product.id}
        variants={variants ?? []}
      />

      <ProductImages
        productId={product.id}
        images={images ?? []}
      />
    </main>
  );
}