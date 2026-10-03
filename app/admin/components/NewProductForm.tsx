"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type NewProductFormProps = {
  categories: Category[];
};

export default function NewProductForm({
  categories,
}: NewProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [stockQuantity, setStockQuantity] =
    useState("0");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    setSlug((currentSlug) => {
      const previousGeneratedSlug =
        generateSlug(name);

      if (
        currentSlug === "" ||
        currentSlug === previousGeneratedSlug
      ) {
        return generateSlug(value);
      }

      return currentSlug;
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    if (!trimmedSlug) {
      setError("Product slug is required.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const price = Number(basePrice);
    const stock = Number(stockQuantity);

    if (!Number.isFinite(price) || price < 0) {
      setError(
        "Base price must be a valid number of 0 or more."
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError(
        "Stock quantity must be a whole number of 0 or more."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            slug: trimmedSlug,
            description:
              trimmedDescription || null,
            category_id: categoryId,
            base_price: price,
            stock_quantity: stock,
            is_active: isActive,
            is_featured: isFeatured,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to create the product."
        );
      }

      if (!result.product?.id) {
        throw new Error(
          "Product was created but its ID was not returned."
        );
      }

      router.push(
        `/admin/products/${result.product.id}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create the product."
      );
    } finally {
      setIsSaving(false);
    }
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

          <h1>Add Product</h1>

          <p className="admin-page-introduction">
            Create a new product for the
            DCClothings catalogue.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Product Information</h2>

            <p className="admin-page-introduction">
              Enter the basic information for this
              product. Variants and images can be
              added after the product is created.
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >
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
                  handleNameChange(
                    event.target.value
                  )
                }
                placeholder="Example: Plain Shirts"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="product-slug">
                Slug
              </label>

              <input
                id="product-slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="plain-shirts"
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
                  setCategoryId(
                    event.target.value
                  )
                }
                required
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
                Base Price
              </label>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(event) =>
                  setBasePrice(
                    event.target.value
                  )
                }
                placeholder="25000"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="product-stock">
                Initial Stock
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(event) =>
                  setStockQuantity(
                    event.target.value
                  )
                }
                required
              />

              <small>
                Total product stock. Variants can
                be managed after creation.
              </small>
            </div>
          </div>

          <div className="admin-form-field">
            <label htmlFor="product-description">
              Description
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Enter the product description..."
              rows={6}
            />
          </div>

          <div className="admin-form-options">
            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked
                  )
                }
              />

              <span>
                <strong>Active</strong>

                <small>
                  Make this product available
                  in the catalogue.
                </small>
              </span>
            </label>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) =>
                  setIsFeatured(
                    event.target.checked
                  )
                }
              />

              <span>
                <strong>Featured</strong>

                <small>
                  Include this product in the
                  featured products section.
                </small>
              </span>
            </label>
          </div>

          <div className="admin-form-actions">
            <Link
              href="/admin/products"
              className="admin-table-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Creating Product..."
                : "Create Product"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}