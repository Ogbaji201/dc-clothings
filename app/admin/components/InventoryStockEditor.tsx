"use client";

import { useState } from "react";

type InventoryStockEditorProps = {
  productId: string;
  initialStock: number;
  onStockUpdated: (
    productId: string,
    newStock: number
  ) => void;
};

export default function InventoryStockEditor({
  productId,
  initialStock,
  onStockUpdated,
}: InventoryStockEditorProps) {
  const [stock, setStock] = useState(
    String(initialStock ?? 0)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveStock() {
    setMessage("");
    setError("");

    const stockNumber = Number(stock);

    if (
      !Number.isInteger(stockNumber) ||
      stockNumber < 0
    ) {
      setError(
        "Stock must be a whole number of 0 or more."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock_quantity: stockNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update stock."
        );
      }

      const updatedStock = Number(
        data.product.stock_quantity
      );

      setStock(String(updatedStock));

      // Tell the parent component about the new stock.
      onStockUpdated(
        productId,
        updatedStock
      );

      setMessage("Saved");
    } catch (error) {
      console.error(
        "Stock update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update stock."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-stock-editor">
      <input
        type="number"
        min="0"
        step="1"
        value={stock}
        onChange={(event) => {
          setStock(event.target.value);
          setMessage("");
          setError("");
        }}
        aria-label="Stock quantity"
      />

      <button
        type="button"
        onClick={saveStock}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>

      {message && (
        <span className="admin-stock-save-message">
          {message}
        </span>
      )}

      {error && (
        <span className="admin-stock-error-message">
          {error}
        </span>
      )}
    </div>
  );
}