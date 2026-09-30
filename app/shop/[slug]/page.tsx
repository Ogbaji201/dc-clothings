import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "../../components/Header";
import ProductDetail from "../../components/ProductDetail";
import Footer from "../../components/Footer";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: product,
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
      product_images (
        id,
        image_url,
        alt_text,
        is_primary,
        display_order
      ),
      product_variants (
        id,
        size,
        color,
        price,
        is_active
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="product-page">

        <div className="product-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <ProductDetail product={product} />

      </main>

      <Footer />
    </>
  );
}