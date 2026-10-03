"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { usePathname } from "next/navigation";

export default function Header() {
  const { itemCount } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const logoUrl =
    "https://loxvtqcwfbmqhejiupxr.supabase.co/storage/v1/object/public/product-image/DCLogo.png";

  /*
   * Determines which navigation item is active.
   *
   * Home is only active on the homepage.
   * Other sections remain active on their sub-pages as well.
   */
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Shop",
      href: "/shop",
    },
    {
      label: "Collections",
      href: "/collections",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

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

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link ${
                isActive(item.href) ? "active" : ""
              }`}
            >
              {item.label}
            </a>
          ))}

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


          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
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

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={isActive(item.href) ? "active" : ""}
            >
              {item.label}
            </a>
          ))}

        </div>
      )}

    </header>
  );
}