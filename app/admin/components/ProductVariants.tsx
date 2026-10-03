"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number | null;
  is_active: boolean;
};

type ProductVariantsProps = {
  productId: string;
  variants: Variant[];
};

const AVAILABLE_COLOURS = [
  "Black",
  "White",
  "Brown",
  "Yellow",
  "Blue",
];

const AVAILABLE_SIZES = [
  "M",
  "L",
  "XL",
  "XXL",
];

type VariantCombination = {
  color: string;
  size: string;
};

export default function ProductVariants({
  productId,
  variants,
}: ProductVariantsProps) {
  const router = useRouter();

  // --------------------------------------------------
  // Existing variant editing
  // --------------------------------------------------

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editSize, setEditSize] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Variant generator
  // --------------------------------------------------

  const [selectedColours, setSelectedColours] =
    useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  const [generatedCombinations, setGeneratedCombinations] =
    useState<VariantCombination[]>([]);

  function toggleColour(colour: string) {
    setSelectedColours((current) =>
      current.includes(colour)
        ? current.filter((item) => item !== colour)
        : [...current, colour]
    );

    setGeneratedCombinations([]);
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );

    setGeneratedCombinations([]);
  }

  function generateCombinations() {
    setError("");
    setSuccess("");

    if (selectedColours.length === 0) {
      setError("Please select at least one colour.");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Please select at least one size.");
      return;
    }

    const existingCombinations = new Set(
      variants.map(
        (variant) =>
          `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`
      )
    );

    const combinations: VariantCombination[] = [];

    for (const colour of selectedColours) {
      for (const size of selectedSizes) {
        const key = `${colour.toLowerCase()}::${size.toLowerCase()}`;

        if (!existingCombinations.has(key)) {
          combinations.push({
            color: colour,
            size,
          });
        }
      }
    }

    if (combinations.length === 0) {
      setError(
        "All of the selected colour and size combinations already exist."
      );
      setGeneratedCombinations([]);
      return;
    }

    setGeneratedCombinations(combinations);
  }

  async function createVariants() {
    if (generatedCombinations.length === 0) {
      setError("Please preview the variants first.");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variants: generatedCombinations,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create the variants."
        );
        return;
      }

      setSuccess(
        result.message ||
          "Variants created successfully."
      );

      setGeneratedCombinations([]);
      setSelectedColours([]);
      setSelectedSizes([]);

      router.refresh();
    } catch (error) {
      console.error(
        "Create variants error:",
        error
      );

      setError(
        "Something went wrong while creating the variants."
      );
    } finally {
      setSaving(false);
    }
  }

  function clearGenerator() {
    setSelectedColours([]);
    setSelectedSizes([]);
    setGeneratedCombinations([]);
    setError("");
    setSuccess("");
  }

  // --------------------------------------------------
  // Existing variant editing functions
  // --------------------------------------------------

  function startEditing(variant: Variant) {
    setEditingId(variant.id);
    setEditSize(variant.size);
    setEditColor(variant.color);
    setEditPrice(String(variant.price));
    setEditStock(
      variant.stock_quantity === null
        ? ""
        : String(variant.stock_quantity)
    );
    setEditActive(variant.is_active);

    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
    setError("");
  }

  async function saveVariant(variantId: string) {
    setSaving(true);
    setError("");
    setSuccess("");

    const price = Number(editPrice);

    const stock =
      editStock.trim() === ""
        ? null
        : Number(editStock);

    if (!editSize.trim()) {
      setError("Size is required.");
      setSaving(false);
      return;
    }

    if (!editColor.trim()) {
      setError("Colour is required.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid price.");
      setSaving(false);
      return;
    }

    if (
      stock !== null &&
      (!Number.isInteger(stock) || stock < 0)
    ) {
      setError("Please enter a valid stock quantity.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: editSize.trim(),
            color: editColor.trim(),
            price,
            stock_quantity: stock,
            is_active: editActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update the variant."
        );
        return;
      }

      setSuccess(
        "Variant updated successfully."
      );

      setEditingId(null);

      router.refresh();
    } catch (error) {
      console.error(
        "Variant update error:",
        error
      );

      setError(
        "Something went wrong while updating the variant."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">

      {/* =========================================
          SECTION HEADER
          ========================================= */}

      <div className="admin-section-header">
        <div>
          <h2>Product Variants</h2>

          <p className="admin-page-introduction">
            Manage the available colour, size, price
            and stock combinations for this product.
          </p>
        </div>

        <p className="admin-record-count">
          {variants.length} variants
        </p>
      </div>

      {/* =========================================
          MESSAGES
          ========================================= */}

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

      {/* =========================================
          VARIANT GENERATOR
          ========================================= */}

      <div className="admin-variant-generator">

        <div className="admin-variant-generator-header">
          <div>
            <h3>Generate Variants</h3>

            <p>
              Select the colours and sizes available
              for this product.
            </p>
          </div>
        </div>

        {/* Colours */}

        <div className="admin-variant-generator-group">

          <label className="admin-variant-generator-label">
            Colours
          </label>

          <div className="admin-variant-choice-grid">

            {AVAILABLE_COLOURS.map((colour) => {
              const selected =
                selectedColours.includes(colour);

              return (
                <label
                  key={colour}
                  className={`admin-variant-choice ${
                    selected
                      ? "admin-variant-choice-selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleColour(colour)
                    }
                  />

                  <span>{colour}</span>
                </label>
              );
            })}

          </div>
        </div>

        {/* Sizes */}

        <div className="admin-variant-generator-group">

          <label className="admin-variant-generator-label">
            Sizes
          </label>

          <div className="admin-variant-choice-grid">

            {AVAILABLE_SIZES.map((size) => {
              const selected =
                selectedSizes.includes(size);

              return (
                <label
                  key={size}
                  className={`admin-variant-choice ${
                    selected
                      ? "admin-variant-choice-selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleSize(size)
                    }
                  />

                  <span>{size}</span>
                </label>
              );
            })}

          </div>
        </div>

        {/* Generator Actions */}

      <div className="admin-variant-generator-actions">

        <button
          type="button"
          className="admin-primary-button"
          onClick={generateCombinations}
          disabled={saving}
        >
          Preview Variants
        </button>

        {generatedCombinations.length > 0 && (
          <button
            type="button"
            className="admin-primary-button"
            onClick={createVariants}
            disabled={saving}
          >
            {saving
              ? "Creating Variants..."
              : `Create ${generatedCombinations.length} Variants`}
          </button>
        )}

        {(selectedColours.length > 0 ||
          selectedSizes.length > 0 ||
          generatedCombinations.length > 0) && (
          <button
            type="button"
            className="admin-table-cancel-button"
            onClick={clearGenerator}
            disabled={saving}
          >
            Clear
          </button>
        )}

      </div>

        {/* Preview */}

        {generatedCombinations.length > 0 && (
          <div className="admin-variant-preview">

            <div className="admin-variant-preview-header">

              <div>
                <h4>
                  Variants to be created
                </h4>

                <p>
                  {generatedCombinations.length} new
                  combinations
                </p>
              </div>

            </div>

            <div className="admin-variant-preview-grid">

              {generatedCombinations.map(
                (combination, index) => (
                  <div
                    key={`${combination.color}-${combination.size}-${index}`}
                    className="admin-variant-preview-item"
                  >
                    <span>
                      {combination.color}
                    </span>

                    <strong>
                      {combination.size}
                    </strong>
                  </div>
                )
              )}

            </div>

            <div className="admin-variant-preview-note">
              <strong>Next step:</strong>{" "}
              These variants will be created using the
              product's current base price. Initial variant
              stock will be set to 0 and can be updated after
              creation.
            </div>

          </div>
        )}

      </div>

      {/* =========================================
          EXISTING VARIANTS
          ========================================= */}

      {variants.length === 0 ? (
        <div className="admin-empty-state">

          <h3>No variants found</h3>

          <p>
            This product currently has no colour or
            size variants.
          </p>

        </div>
      ) : (
        <div className="admin-table-wrapper">

          <table className="admin-table admin-variants-table">

            <thead>
              <tr>
                <th>Colour</th>
                <th>Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {variants.map((variant) => {

                const isEditing =
                  editingId === variant.id;

                if (isEditing) {
                  return (
                    <tr key={variant.id}>

                      <td>
                        <input
                          className="admin-inline-input"
                          type="text"
                          value={editColor}
                          onChange={(event) =>
                            setEditColor(
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="admin-inline-input"
                          type="text"
                          value={editSize}
                          onChange={(event) =>
                            setEditSize(
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPrice}
                          onChange={(event) =>
                            setEditPrice(
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0"
                          step="1"
                          value={editStock}
                          onChange={(event) =>
                            setEditStock(
                              event.target.value
                            )
                          }
                          placeholder="—"
                        />
                      </td>

                      <td>
                        <label className="admin-inline-checkbox">

                          <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(event) =>
                              setEditActive(
                                event.target.checked
                              )
                            }
                          />

                          Active

                        </label>
                      </td>

                      <td>

                        <div className="admin-variant-actions">

                          <button
                            type="button"
                            className="admin-table-action-button"
                            onClick={() =>
                              saveVariant(
                                variant.id
                              )
                            }
                            disabled={saving}
                          >
                            {saving
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            className="admin-table-cancel-button"
                            onClick={
                              cancelEditing
                            }
                            disabled={saving}
                          >
                            Cancel
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }

                return (
                  <tr key={variant.id}>

                    <td>
                      <div className="admin-table-primary">
                        {variant.color}
                      </div>
                    </td>

                    <td>
                      {variant.size}
                    </td>

                    <td>
                      ₦
                      {Number(
                        variant.price
                      ).toLocaleString(
                        "en-NG"
                      )}
                    </td>

                    <td>
                      {variant.stock_quantity ??
                        "—"}
                    </td>

                    <td>

                      {variant.is_active ? (
                        <span className="admin-status admin-status-confirmed">
                          Active
                        </span>
                      ) : (
                        <span className="admin-status">
                          Inactive
                        </span>
                      )}

                    </td>

                    <td>

                      <button
                        type="button"
                        className="admin-table-action-button"
                        onClick={() =>
                          startEditing(
                            variant
                          )
                        }
                      >
                        Edit
                      </button>

                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}