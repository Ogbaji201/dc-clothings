import ProductCard from "./ProductCard";

type ProductImage = {
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  product_images?: ProductImage[];
};

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  return (
    <section className="featured-section">

      {/* Header */}

      <div className="featured-section-header">

        <h2>
          Featured Products
        </h2>

        <a
          href="/shop"
          className="featured-view-all"
        >
          View All Products
          <span>→</span>
        </a>

      </div>


      {/* Products */}

      <div className="featured-grid">

        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </section>
  );
}