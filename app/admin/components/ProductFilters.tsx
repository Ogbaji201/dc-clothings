"use client";

import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category_id: string;
  category_name: string;
};

type ProductFiltersProps = {
  products: Product[];
  categories: Category[];
};

export default function ProductFilters({
  products,
  categories,
}: ProductFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.slug.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" ||
        product.category_id === category;

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.is_active) ||
        (status === "inactive" && !product.is_active);

      const matchesFeatured =
        featured === "all" ||
        (featured === "featured" && product.is_featured) ||
        (featured === "standard" && !product.is_featured);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured
      );
    });
  }, [products, search, category, status, featured]);

  return (
    <div>
      <div className="admin-product-filters">
        <div className="admin-product-search">
          <label htmlFor="product-search">
            Search Products
          </label>

          <input
            id="product-search"
            type="text"
            placeholder="Search by product name or slug..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="admin-product-filter">
          <label htmlFor="product-category">
            Category
          </label>

          <select
            id="product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-product-filter">
          <label htmlFor="product-status">
            Status
          </label>

          <select
            id="product-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin-product-filter">
          <label htmlFor="product-featured">
            Featured
          </label>

          <select
            id="product-featured"
            value={featured}
            onChange={(event) => setFeatured(event.target.value)}
          >
            <option value="all">All Products</option>
            <option value="featured">Featured</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      <div className="admin-filter-results">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No products found</h3>

          <p>
            Try changing your search or filter selection.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
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
                    {product.category_name || "Uncategorised"}
                  </td>

                  <td>
                    ₦
                    {Number(product.base_price).toLocaleString(
                      "en-NG"
                    )}
                  </td>

                  <td>
                    {product.stock_quantity}
                  </td>

                  <td>
                    {product.is_active ? (
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
                    {product.is_featured ? (
                      <span className="admin-status admin-status-confirmed">
                        Featured
                      </span>
                    ) : (
                      <span className="admin-status">
                        Standard
                      </span>
                    )}
                  </td>

                  <td>
                    {new Date(
                      product.created_at
                    ).toLocaleDateString("en-NG")}
                  </td>

                  <td>
                    <a
                      href={`/admin/products/${product.id}`}
                      className="admin-table-action"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}