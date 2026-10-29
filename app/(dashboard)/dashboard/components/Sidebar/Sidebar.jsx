
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Sidebar.scss";
import { logout } from "./actions";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "My websites",
    href: "/dashboard/sites",
    icon: "▧",
  },
  {
    label: "Account",
    href: "/dashboard/account",
    icon: "○",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="sidebar__menu-button"
        aria-label="Open navigation menu"
        aria-controls="dashboard-sidebar"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <button
          type="button"
          className="sidebar__overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
        aria-label="Dashboard navigation"
      >
        <div className="sidebar__top">
          <Link href="/dashboard" className="sidebar__brand">
            <span>Make-A-Site</span>
          </Link>

          <button
            type="button"
            className="sidebar__close-button"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="sidebar__label">WORKSPACE</div>

        <nav className="sidebar__nav">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${
                  isActive ? "sidebar__link--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__note">
            <span className="sidebar__note-icon" aria-hidden="true">
              ♡
            </span>
            <p>Make something meaningful for someone special.</p>
          </div>

          <form action={logout}>
            <button type="submit" className="sidebar__logout">
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
