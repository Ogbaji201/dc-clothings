"use client";

import { useMemo, useState } from "react";
import InventoryStockEditor from "./InventoryStockEditor";

type InventoryProduct = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
};

type InventoryFiltersProps = {
  products: InventoryProduct[];
  categories: Category[];
};

function getStockStatus(stock: number) {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in";
}

export default function InventoryFilters({
  products,
  categories,
}: InventoryFiltersProps) {
  const [inventoryProducts, setInventoryProducts] =
    useState<InventoryProduct[]>(products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  function handleStockUpdated(
    productId: string,
    newStock: number
  ) {
    setInventoryProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock_quantity: newStock,
            }
          : product
      )
    );
  }

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return inventoryProducts.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.slug.toLowerCase().includes(searchTerm);

      const matchesCategory =
        category === "all" ||
        product.category_id === category;

      const matchesStock =
        stockStatus === "all" ||
        getStockStatus(product.stock_quantity ?? 0) ===
          stockStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    inventoryProducts,
    search,
    category,
    stockStatus,
  ]);

  const totalStock = useMemo(() => {
    return inventoryProducts.reduce(
      (total, product) =>
        total + (product.stock_quantity ?? 0),
      0
    );
  }, [inventoryProducts]);

  const lowStockCount = useMemo(() => {
    return inventoryProducts.filter((product) => {
      const stock = product.stock_quantity ?? 0;

      return stock > 0 && stock <= 5;
    }).length;
  }, [inventoryProducts]);

  const outOfStockCount = useMemo(() => {
    return inventoryProducts.filter(
      (product) =>
        (product.stock_quantity ?? 0) <= 0
    ).length;
  }, [inventoryProducts]);

  const hasFilters =
    search !== "" ||
    category !== "all" ||
    stockStatus !== "all";

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setStockStatus("all");
  }

  return (
    <>
      {/* =========================================
          LIVE INVENTORY SUMMARY
      ========================================= */}

      <div className="admin-overview">
        <div className="admin-stat-card">
          <span>Products</span>

          <strong>
            {inventoryProducts.length}
          </strong>

          <p>
            Total products in the catalogue.
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Total Stock</span>

          <strong>
            {totalStock}
          </strong>

          <p>
            Total units currently recorded.
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Low Stock</span>

          <strong>
            {lowStockCount}
          </strong>

          <p>
            Products with 1–5 units remaining.
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Out of Stock</span>

          <strong>
            {outOfStockCount}
          </strong>

          <p>
            Products with no units available.
          </p>
        </div>
      </div>

      {/* =========================================
          INVENTORY FILTERS
      ========================================= */}

      <div className="admin-inventory-filters">
        <div className="admin-inventory-search">
          <label htmlFor="inventory-search">
            Search
          </label>

          <input
            id="inventory-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product name or slug..."
          />
        </div>

        <div className="admin-inventory-filter">
          <label htmlFor="inventory-category">
            Category
          </label>

          <select
            id="inventory-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-inventory-filter">
          <label htmlFor="inventory-stock">
            Stock Status
          </label>

          <select
            id="inventory-stock"
            value={stockStatus}
            onChange={(event) =>
              setStockStatus(event.target.value)
            }
          >
            <option value="all">
              All Stock
            </option>

            <option value="in">
              In Stock
            </option>

            <option value="low">
              Low Stock
            </option>

            <option value="out">
              Out of Stock
            </option>
          </select>
        </div>

        <div className="admin-inventory-filter-action">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* =========================================
          RESULTS COUNT
      ========================================= */}

      <div className="admin-inventory-results">
        <span>
          Showing {filteredProducts.length} of{" "}
          {inventoryProducts.length} products
        </span>
      </div>

      {/* =========================================
          INVENTORY TABLE
      ========================================= */}

      <div className="admin-table-wrapper">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">
            <h3>
              No matching products
            </h3>

            <p>
              Try changing your search or
              filter selections.
            </p>
          </div>
        ) : (
          <table className="admin-table admin-inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Stock Status</th>
                <th>Catalogue Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock =
                  product.stock_quantity ?? 0;

                let stockLabel = "In Stock";
                let stockClass =
                  "admin-stock-status-in";

                if (stock <= 0) {
                  stockLabel = "Out of Stock";
                  stockClass =
                    "admin-stock-status-out";
                } else if (stock <= 5) {
                  stockLabel = "Low Stock";
                  stockClass =
                    "admin-stock-status-low";
                }

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-table-primary">
                        {product.name}
                      </div>

                      <div className="admin-table-secondary">
                        {product.slug}
                      </div>
                    </td>

                    <td>
                      {product.category_id
                        ? categories.find(
                            (item) =>
                              item.id ===
                              product.category_id
                          )?.name ||
                          "Uncategorised"
                        : "Uncategorised"}
                    </td>

                    <td>
                      ₦
                      {Number(
                        product.base_price
                      ).toLocaleString("en-NG")}
                    </td>

                    <td>
                      <InventoryStockEditor
                        productId={product.id}
                        initialStock={stock}
                        onStockUpdated={
                          handleStockUpdated
                        }
                      />
                    </td>

                    <td>
                      <span
                        className={`admin-stock-status ${stockClass}`}
                      >
                        {stockLabel}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          product.is_active
                            ? "admin-status admin-status-active"
                            : "admin-status admin-status-inactive"
                        }
                      >
                        {product.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <a
                        href={`/admin/products/${product.id}`}
                        className="admin-table-action"
                      >
                        Manage
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}