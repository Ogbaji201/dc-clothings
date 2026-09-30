"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

type ProductImage = {
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
};

type Category = {
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  stock_quantity?: number | null;
  is_featured?: boolean;
  categories?: Category | Category[] | null;
  product_images?: ProductImage[];
};

export default function ShopProductGrid({
  products,
}: {
  products: Product[];
}) {
  const [sortOption, setSortOption] =
    useState("newest");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  /*
   * Get unique categories from the products
   */
  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>();

    products.forEach((product) => {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      if (category) {
        categoryMap.set(
          category.slug,
          category.name
        );
      }
    });

    return Array.from(categoryMap.entries()).map(
      ([slug, name]) => ({
        slug,
        name,
      })
    );
  }, [products]);

  /*
   * Filter + sort products
   */
  const displayedProducts = useMemo(() => {
    let result = [...products];

    /*
     * CATEGORY FILTER
     */
    if (selectedCategory !== "all") {
      result = result.filter((product) => {
        const category = Array.isArray(
          product.categories
        )
          ? product.categories[0]
          : product.categories;

        return (
          category?.slug === selectedCategory
        );
      });
    }

    /*
     * SORT
     */
    if (sortOption === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.base_price) -
          Number(b.base_price)
      );
    }

    if (sortOption === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.base_price) -
          Number(a.base_price)
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    sortOption,
  ]);

  return (
    <>
      {/* Toolbar */}
      <div className="shop-toolbar">

        <p>
          {displayedProducts.length}{" "}
          {displayedProducts.length === 1
            ? "Product"
            : "Products"}
        </p>

        <div className="shop-controls">

          {/* Category Filter */}
          <div className="shop-filter">

            <span>Category</span>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.slug}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </select>

          </div>

          {/* Sort */}
          <div className="shop-sort">

            <span>Sort by</span>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target.value
                )
              }
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* Product Grid */}

      {displayedProducts.length > 0 ? (
        <div className="shop-product-grid">
          {displayedProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      ) : (
        <div className="shop-empty">
          <p>
            No products found in this
            category.
          </p>
        </div>
      )}
    </>
  );
}