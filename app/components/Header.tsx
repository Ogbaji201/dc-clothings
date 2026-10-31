
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { createClient } from "../../lib/supabase/client";

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
};

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] =
    useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const logoUrl =
    "https://wyoycuacvenjisgsznoa.supabase.co/storage/v1/object/public/Naija%20Laugh/Logo.jpeg";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Search active products as the customer types.
  useEffect(() => {
    const term = searchTerm.trim();

    if (!searchOpen || term.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, base_price")
          .eq("is_active", true)
          .or(`name.ilike.%${term.replace(/[%_,().]/g, " ")}%,slug.ilike.%${term.replace(/[%_,().]/g, " ")}%`)
          .order("name", { ascending: true })
          .limit(8);

        if (error) throw error;

        if (!cancelled) {
          setSearchResults((data ?? []) as SearchProduct[]);
        }
      } catch (error) {
        console.error("Product search failed:", error);

        if (!cancelled) {
          setSearchResults([]);
          setSearchError(
            "We couldn't load search results. Please try again."
          );
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, searchOpen]);

  // Close the search panel when clicking outside it.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setSearchError("");
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(price));
  }

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="brand">
          <img
            src={logoUrl}
            alt="DCClothings"
            className="brand-logo"
          />
          <div className="brand-tagline">
          <span className="brand-name">DC Clothings</span> 
          <span className = "brand-tagline"> <br />Premium Quality, Made in Nigeria.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${
                isActive(item.href) ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="icon-button search-button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>

          <Link
            href="/account"
            className="icon-button"
            aria-label="Account"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
            </svg>
          </Link>

          <Link
            href="/cart"
            className="cart-button"
            aria-label={`Shopping cart with ${itemCount} ${
              itemCount === 1 ? "item" : "items"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M3 4h2l2.5 12h10L20 7H6" />
              <circle cx="10" cy="20" r="1.2" />
              <circle cx="17" cy="20" r="1.2" />
            </svg>
            <span className="cart-count">{itemCount}</span>
          </Link>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Live Search Panel */}
      {searchOpen && (
        <div className="search-panel" ref={searchRef}>
          <div className="search-panel-inner">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search for products..."
              autoFocus
              aria-label="Search products"
              aria-controls="product-search-results"
            />

            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
            >
              ×
            </button>
          </div>

          <div
            id="product-search-results"
            className="search-results"
          >
            {searchTerm.trim().length < 2 ? (
              <p className="search-message">
                Type at least 2 characters to find products.
              </p>
            ) : searching ? (
              <p className="search-message">
                Searching products...
              </p>
            ) : searchError ? (
              <p className="search-message search-error">
                {searchError}
              </p>
            ) : searchResults.length === 0 ? (
              <p className="search-message">
                No products found for “{searchTerm.trim()}”.
              </p>
            ) : (
              <div className="search-results-list">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="search-result-item"
                    onClick={closeSearch}
                  >
                    <span className="search-result-name">
                      {product.name}
                    </span>
                    <span className="search-result-price">
                      {formatPrice(product.base_price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <Link
                href={`/shop?search=${encodeURIComponent(
                  searchTerm.trim()
                )}`}
                className="search-view-all"
                onClick={closeSearch}
              >
                View all matching products
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={isActive(item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
