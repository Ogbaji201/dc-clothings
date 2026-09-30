"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
};

type ProductEditFormProps = {
  product: Product;
  categories: Category[];
};

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(
    product.description ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    product.category_id ?? ""
  );
  const [basePrice, setBasePrice] = useState(
    String(product.base_price)
  );
  const [stockQuantity, setStockQuantity] = useState(
    String(product.stock_quantity)
  );
  const [isActive, setIsActive] = useState(product.is_active);
  const [isFeatured, setIsFeatured] = useState(
    product.is_featured
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    const price = Number(basePrice);
    const stock = Number(stockQuantity);

    if (!name.trim()) {
      setError("Product name is required.");
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError("Product slug is required.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Please enter a valid stock quantity.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            category_id: categoryId || null,
            base_price: price,
            stock_quantity: stock,
            is_active: isActive,
            is_featured: isFeatured,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to update the product."
        );
        return;
      }

      setSuccess("Product updated successfully.");

      router.refresh();
    } catch (error) {
      console.error("Product update error:", error);
      setError("Something went wrong while updating the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-product-edit-form"
    >
      <div className="admin-form-section">
        <div className="admin-form-section-heading">
          <h2>Product Information</h2>
          <p>
            Update the basic information displayed for this product.
          </p>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-field">
            <label htmlFor="product-name">
              Product Name
            </label>

            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="product-slug">
              Product Slug
            </label>

            <input
              id="product-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              required
            />

            <small>
              Used in the product URL.
            </small>
          </div>

          <div className="admin-form-field">
            <label htmlFor="product-category">
              Category
            </label>

            <select
              id="product-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-field">
            <label htmlFor="product-price">
              Base Price (₦)
            </label>

            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(event) =>
                setBasePrice(event.target.value)
              }
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="product-stock">
              Total Stock
            </label>

            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) =>
                setStockQuantity(event.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="admin-form-field">
          <label htmlFor="product-description">
            Description
          </label>

          <textarea
            id="product-description"
            rows={6}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Enter the product description..."
          />
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-form-section-heading">
          <h2>Catalogue Settings</h2>
          <p>
            Control how this product appears in the catalogue.
          </p>
        </div>

        <div className="admin-toggle-grid">
          <label className="admin-toggle-card">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
            />

            <span>
              <strong>Active Product</strong>
              <small>
                Product is available in the catalogue.
              </small>
            </span>
          </label>

          <label className="admin-toggle-card">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(event.target.checked)
              }
            />

            <span>
              <strong>Featured Product</strong>
              <small>
                Product appears in featured product sections.
              </small>
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success-message">
          {success}
        </div>
      )}

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-save-status-button"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}