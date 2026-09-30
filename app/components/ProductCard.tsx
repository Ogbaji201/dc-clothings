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

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const primaryImage =
    product.product_images?.find(
      (image) => image.is_primary
    ) ||
    product.product_images?.[0];

  return (
    <article className="product-card">

      {/* Product Image */}

      <a
        href={`/shop/${product.slug}`}
        className="product-image-link"
      >
        <div className="product-image-wrapper">

          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={
                primaryImage.alt_text ||
                product.name
              }
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              No image
            </div>
          )}

          <button
            className="product-quick-add"
            aria-label={`Add ${product.name} to cart`}
          >
            +
          </button>

        </div>
      </a>


      {/* Product Information */}

      <div className="product-information">

        <div className="product-details">

          <h3>
            {product.name}
          </h3>

          <p>
            ₦
            {Number(
              product.base_price
            ).toLocaleString()}
          </p>

        </div>


        {/* Cart Button */}

        <button
          className="product-cart-button"
          aria-label={`Add ${product.name} to cart`}
        >

          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h2l2.5 12h10L20 7H6" />
            <circle
              cx="10"
              cy="20"
              r="1.2"
            />
            <circle
              cx="17"
              cy="20"
              r="1.2"
            />
          </svg>

        </button>

      </div>

    </article>
  );
}