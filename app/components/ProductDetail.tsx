"use client";

import { useEffect, useState } from "react";
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
  stock_quantity?: number | null;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  stock_quantity?: number | null;
  inventory_mode: "product" | "variant";
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

  /*
   * ==========================================
   * ACTIVE VARIANTS
   * ==========================================
   */

  const activeVariants = variants.filter(
    (variant) => variant.is_active
  );

  /*
   * ==========================================
   * AVAILABLE COLOURS
   * ==========================================
   */

  const colors = Array.from(
    new Set(
      activeVariants
        .map((variant) => variant.color)
        .filter(Boolean)
    )
  ) as string[];

  /*
   * ==========================================
   * AVAILABLE SIZES
   * ==========================================
   */

  const sizes = Array.from(
    new Set(
      activeVariants
        .map((variant) => variant.size)
        .filter(Boolean)
    )
  ) as string[];

  /*
   * ==========================================
   * SELECTED VARIANT
   * ==========================================
   */

  const selectedVariant = activeVariants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize
  );

  /*
   * ==========================================
   * DISPLAY PRICE
   * ==========================================
   */

  const displayPrice =
    selectedVariant?.price ??
    product.base_price;

  /*
   * ==========================================
   * AVAILABLE STOCK
   *
   * Product Stock:
   * products.stock_quantity
   *
   * Variant Stock:
   * selectedVariant.stock_quantity
   * ==========================================
   */

  const availableStock =
    product.inventory_mode === "variant"
      ? Number(
          selectedVariant?.stock_quantity ?? 0
        )
      : Number(
          product.stock_quantity ?? 0
        );

  /*
   * ==========================================
   * RESET QUANTITY WHEN SELECTION CHANGES
   * ==========================================
   */

  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  /*
   * ==========================================
   * KEEP QUANTITY WITHIN AVAILABLE STOCK
   * ==========================================
   */

  useEffect(() => {
    if (
      availableStock > 0 &&
      quantity > availableStock
    ) {
      setQuantity(availableStock);
    }
  }, [availableStock, quantity]);

  /*
   * ==========================================
   * CAN ADD TO CART
   * ==========================================
   */

  const canAddToCart =
    selectedVariant !== undefined &&
    selectedColor !== null &&
    selectedSize !== null &&
    availableStock > 0 &&
    quantity <= availableStock;

  /*
   * ==========================================
   * INCREASE QUANTITY
   * ==========================================
   */

  function increaseQuantity() {
    if (quantity >= availableStock) {
      return;
    }

    setQuantity(
      (currentQuantity) =>
        currentQuantity + 1
    );
  }

  /*
   * ==========================================
   * DECREASE QUANTITY
   * ==========================================
   */

  function decreaseQuantity() {
    setQuantity(
      (currentQuantity) =>
        Math.max(1, currentQuantity - 1)
    );
  }

  /*
   * ==========================================
   * HANDLE ADD TO CART
   * ==========================================
   */

  function handleAddToCart() {
    if (
      !selectedVariant ||
      !selectedColor ||
      !selectedSize ||
      availableStock <= 0 ||
      quantity > availableStock
    ) {
      return;
    }

    const primaryImage =
      images.find(
        (image) => image.is_primary
      ) || images[0];

    addToCart({
      cartItemId:
        `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
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
          ₦
          {Number(
            displayPrice
          ).toLocaleString()}
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
                  onClick={() => {
                    setSelectedColor(color);
                  }}
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
                  onClick={() => {
                    setSelectedSize(size);
                  }}
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
              disabled={quantity <= 1}
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={increaseQuantity}
              aria-label="Increase quantity"
              disabled={
                availableStock <= 0 ||
                quantity >= availableStock
              }
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
          {!selectedColor ||
          !selectedSize
            ? "SELECT SIZE & COLOUR"
            : availableStock <= 0
            ? "OUT OF STOCK"
            : "ADD TO CART"}

          <span>→</span>
        </button>

        {/* STOCK */}

        {!selectedColor ||
        !selectedSize ? (
          product.inventory_mode ===
            "product" &&
          Number(
            product.stock_quantity ?? 0
          ) <= 0 ? (
            <p className="product-stock out-of-stock">
              Out of stock
            </p>
          ) : (
            <p className="product-stock">
              Select a size and colour
            </p>
          )
        ) : availableStock <= 0 ? (
          <p className="product-stock out-of-stock">
            This selection is out of stock
          </p>
        ) : (
          <p className="product-stock">
            {availableStock}{" "}
            {availableStock === 1
              ? "unit"
              : "units"}{" "}
            available
          </p>
        )}

      </div>

    </section>
  );
}