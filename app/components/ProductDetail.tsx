"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";


type ProductImage = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
};

type ProductVariant = {
  id: string;
  size?: string | null;
  color?: string | null;
  price?: number | null;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  stock_quantity?: number | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export default function ProductDetail({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const images = product.product_images ?? [];
  const variants = product.product_variants ?? [];

  const [selectedImage, setSelectedImage] =
    useState(
      images.find((image) => image.is_primary) ??
        images[0]
    );

  const [selectedColor, setSelectedColor] =
    useState<string | null>(null);

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  const colors = Array.from(
    new Set(
      variants
        .filter((variant) => variant.is_active)
        .map((variant) => variant.color)
        .filter(Boolean)
    )
  ) as string[];

  const sizes = Array.from(
    new Set(
      variants
        .filter((variant) => variant.is_active)
        .map((variant) => variant.size)
        .filter(Boolean)
    )
  ) as string[];

  const selectedVariant = variants.find(
    (variant) =>
      variant.is_active &&
      variant.color === selectedColor &&
      variant.size === selectedSize
  );

  const displayPrice =
    selectedVariant?.price ??
    product.base_price;

  const canAddToCart =
    product.stock_quantity !== 0 &&
    selectedColor !== null &&
    selectedSize !== null;

  function increaseQuantity() {
    if (
      product.stock_quantity &&
      quantity >= product.stock_quantity
    ) {
      return;
    }

    setQuantity((current) => current + 1);
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

function handleAddToCart() {
  if (
    !selectedVariant ||
    !selectedColor ||
    !selectedSize
  ) {
    return;
  }

  const primaryImage =
    images.find(
      (image) => image.is_primary
    ) || images[0];

  addToCart({
    cartItemId:
      `${product.id}-${selectedColor}-${selectedSize}`,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(displayPrice),
    quantity,
    size: selectedSize,
    color: selectedColor,
    imageUrl:
      primaryImage?.image_url,
  });

  alert(
    `${product.name} has been added to your cart.`
  );
}

  return (
    <section className="product-detail">

      {/* =================================
          IMAGE AREA
      ================================= */}

      <div className="product-detail-gallery">

        <div className="product-detail-main-image">

          {selectedImage ? (
            <img
              src={selectedImage.image_url}
              alt={
                selectedImage.alt_text ||
                product.name
              }
            />
          ) : (
            <div className="product-detail-placeholder">
              No image available
            </div>
          )}

        </div>

        {images.length > 1 && (
          <div className="product-detail-thumbnails">

            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                className={
                  selectedImage?.id === image.id
                    ? "product-thumbnail active"
                    : "product-thumbnail"
                }
                onClick={() =>
                  setSelectedImage(image)
                }
              >
                <img
                  src={image.image_url}
                  alt={
                    image.alt_text ||
                    product.name
                  }
                />
              </button>
            ))}

          </div>
        )}

      </div>


      {/* =================================
          PRODUCT INFORMATION
      ================================= */}

      <div className="product-detail-information">

        <p className="product-detail-eyebrow">
          DC CLOTHINGS
        </p>

        <h1>{product.name}</h1>

        <p className="product-detail-price">
          ₦{Number(displayPrice).toLocaleString()}
        </p>

        {product.description && (
          <p className="product-detail-description">
            {product.description}
          </p>
        )}


        {/* COLOUR */}

        {colors.length > 0 && (
          <div className="product-option">

            <div className="product-option-header">
              <span>Colour</span>

              {selectedColor && (
                <strong>
                  {selectedColor}
                </strong>
              )}
            </div>

            <div className="product-color-options">

              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    selectedColor === color
                      ? "product-color-button active"
                      : "product-color-button"
                  }
                  onClick={() =>
                    setSelectedColor(color)
                  }
                >
                  {color}
                </button>
              ))}

            </div>

          </div>
        )}


        {/* SIZE */}

        {sizes.length > 0 && (
          <div className="product-option">

            <div className="product-option-header">
              <span>Size</span>

              {selectedSize && (
                <strong>
                  {selectedSize}
                </strong>
              )}
            </div>

            <div className="product-size-options">

              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={
                    selectedSize === size
                      ? "product-size-button active"
                      : "product-size-button"
                  }
                  onClick={() =>
                    setSelectedSize(size)
                  }
                >
                  {size}
                </button>
              ))}

            </div>

          </div>
        )}


        {/* QUANTITY */}

        <div className="product-option">

          <div className="product-option-header">
            <span>Quantity</span>
          </div>

          <div className="product-quantity">

            <button
              type="button"
              onClick={decreaseQuantity}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={increaseQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>

          </div>

        </div>


        {/* ADD TO CART */}

        <button
          type="button"
          className="product-add-to-cart"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
        >
          {!selectedColor || !selectedSize
            ? "SELECT SIZE & COLOUR"
            : "ADD TO CART"}

          <span>→</span>
        </button>


        {/* STOCK */}

        {product.stock_quantity === 0 ? (
          <p className="product-stock out-of-stock">
            Out of stock
          </p>
        ) : (
          <p className="product-stock">
            Available for order
          </p>
        )}

      </div>

    </section>
  );
}