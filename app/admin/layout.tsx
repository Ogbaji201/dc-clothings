"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const supabase = createClient();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  const navigation = [
    {
      label: "Dashboard",
      href: "/admin",
    },
    {
      label: "Orders",
      href: "/admin/orders",
    },
    {
      label: "Products",
      href: "/admin/products",
    },
    {
      label: "Inventory",
      href: "/admin/inventory",
    },
    {
      label: "Contact Messages",
      href: "/admin/contact",
    },
    {
      label: "Bulk Orders",
      href: "/admin/bulk-orders",
    },
    {
      label: "Custom Orders",
      href: "/admin/custom-orders",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="admin-layout">

      {/* MOBILE HEADER */}

      <header className="admin-mobile-header">

        <Link
          href="/admin"
          className="admin-mobile-logo"
        >
          DC CLOTHINGS
        </Link>

        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={() =>
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }
          aria-label="Toggle admin menu"
        >
          {isMobileMenuOpen ? "×" : "☰"}
        </button>

      </header>


      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${
          isMobileMenuOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-sidebar-top">

          <Link
            href="/admin"
            className="admin-logo"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>
              DC
            </span>

            <span>
              CLOTHINGS
            </span>
          </Link>


          <p className="admin-sidebar-label">
            ADMINISTRATION
          </p>


          <nav className="admin-navigation">

            {navigation.map((item) => (

              <Link
                key={item.href}
                href={item.href}
                className={`admin-navigation-link ${
                  isActive(item.href)
                    ? "admin-navigation-link-active"
                    : ""
                }`}
                onClick={() =>
                  setIsMobileMenuOpen(false)
                }
              >
                <span>
                  {item.label}
                </span>

                {isActive(item.href) && (
                  <span className="admin-navigation-indicator">
                    →
                  </span>
                )}
              </Link>

            ))}

          </nav>

        </div>


        {/* SIDEBAR BOTTOM */}

        <div className="admin-sidebar-bottom">

          <Link
            href="https://dc-clothings.vercel.app"
            className="admin-sidebar-secondary-link"
          >
            ← View Website
          </Link>


          <button
            type="button"
            className="admin-signout-button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut
              ? "Signing Out..."
              : "Sign Out"}

            <span>
              →
            </span>
          </button>

        </div>

      </aside>


      {/* MOBILE OVERLAY */}

      {isMobileMenuOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close admin menu"
        />
      )}


      {/* MAIN CONTENT */}

      <div className="admin-content">
        {children}
      </div>

    </div>
  );
}