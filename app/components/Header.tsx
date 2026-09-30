"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logoUrl =
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/DCLogo.png";

  return (
    <header className="site-header">
      <div className="header-container">

        {/* Logo */}
        <a href="/" className="brand">

          <img
            src={logoUrl}
            alt="DCClothings"
            className="brand-logo"
          />

          <div className="brand-tagline">
            Nigerian Made. Designed to Last.
          </div>

        </a>


        {/* Desktop Navigation */}
        <nav className="desktop-nav">

          <a href="/" className="nav-link active">
            Home
          </a>

          <a href="/shop" className="nav-link">
            Shop
          </a>

          <a href="/collections" className="nav-link">
            Collections
          </a>

          <a href="/about" className="nav-link">
            About
          </a>

          <a href="/contact" className="nav-link">
            Contact
          </a>

        </nav>


        {/* Header Actions */}
        <div className="header-actions">

          {/* Search */}
          <button
            className="icon-button search-button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
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


          {/* Account */}
          <a
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
          </a>


          {/* Cart */}
          <a
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

            <span className="cart-count">
              {itemCount}
            </span>
          </a>


          {/* Mobile Menu */}
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>
      </div>


      {/* Search Bar */}
      {searchOpen && (
        <div className="search-panel">

          <div className="search-panel-inner">

            <input
              type="text"
              placeholder="Search for products..."
              autoFocus
            />

            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              ×
            </button>

          </div>

        </div>
      )}


      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mobile-menu">

          <a
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>

          <a
            href="/shop"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </a>

          <a
            href="/collections"
            onClick={() => setMenuOpen(false)}
          >
            Collections
          </a>

          <a
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>

          <a
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>

        </div>
      )}

    </header>
  );
}