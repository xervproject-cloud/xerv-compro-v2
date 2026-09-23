"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowIcon } from "@/components/shell/ArrowIcon";
import { Logo } from "@/components/shell/Logo";
import type { Navbar } from "@/lib/types";

type SidebarProps = {
  navbar: Navbar;
  workName?: string;
};

export function Sidebar({ navbar, workName }: SidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const isHome = pathname === "/";
  const isWorksIndex = pathname === "/works";
  const isWorkDetail = pathname.startsWith("/works/") && pathname !== "/works";
  const isAbout = pathname === "/about";

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => {
      if (!mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const nav = document.getElementById("site-nav");
    const main = document.querySelector<HTMLElement>("main.main");

    html.classList.toggle("is-menu", menuOpen);

    if (nav) {
      if (menuOpen) nav.setAttribute("data-lenis-prevent", "");
      else nav.removeAttribute("data-lenis-prevent");
    }

    if (main) main.inert = menuOpen;

    window.dispatchEvent(
      new CustomEvent("xerv:menu", { detail: { open: menuOpen } }),
    );

    return () => {
      html.classList.remove("is-menu");
      nav?.removeAttribute("data-lenis-prevent");
      if (main) main.inert = false;
      window.dispatchEvent(new CustomEvent("xerv:menu", { detail: { open: false } }));
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Logo href={isHome ? "/#intro" : "/"} />
        <p className="logo-meta">
          Custom Software Agency
          <br />
          Est. 2023 — West Java, ID
        </p>
        <button
          className="menu-toggle"
          type="button"
          aria-controls="site-nav"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle-mark" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <nav
        className="nav"
        id="site-nav"
        aria-label="Primary"
        onClick={(event) => {
          if (
            window.matchMedia("(max-width: 767px)").matches &&
            (event.target as Element).closest("a[href]")
          ) {
            setMenuOpen(false);
          }
        }}
      >
        <ul className="nav-list">
          {navbar.primary.map((item) => {
            if (item.variant === "start") {
              return (
                <li key={item.id} className="nav-item nav-item-start">
                  <a className="nav-link nav-link-start" href="#contact">
                    <span>{item.label}</span>
                    <ArrowIcon />
                  </a>
                </li>
              );
            }

            if (item.id === "home") {
              return (
                <li key={item.id} className={`nav-item${isHome ? " is-current" : ""}`}>
                  <Link
                    className="nav-link"
                    href="/"
                    aria-current={isHome ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className="nav-dot" aria-hidden="true" />
                  </Link>
                  {isHome ? (
                    <ul className="subnav" aria-label="Home sections">
                      {navbar.homeSubnav.map((link) => (
                        <li key={link.id}>
                          <a
                            className="subnav-link"
                            href={link.href}
                            data-scrollspy={link.id}
                          >
                            <span className="subnav-index">{link.index}</span>
                            <span className="subnav-rule" aria-hidden="true">
                              <i />
                            </span>
                            <span className="subnav-label">{link.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            }

            if (item.id === "works") {
              if (isWorkDetail) {
                return (
                  <li key={item.id} className="nav-item is-current">
                    <div className="nav-link nav-crumb" aria-current="page">
                      <span>
                        <Link className="nav-crumb-root" href="/works">
                          Works
                        </Link>
                        <span className="nav-crumb-sep" aria-hidden="true">
                          /
                        </span>
                        <span className="nav-crumb-leaf">{workName}</span>
                      </span>
                      <span className="nav-dot" aria-hidden="true" />
                    </div>
                    <ul className="subnav" aria-label="Case study sections">
                      {navbar.workDetailSubnav.map((link) => (
                        <li key={link.id}>
                          <a
                            className="subnav-link"
                            href={link.href}
                            data-scrollspy={link.id}
                          >
                            <span className="subnav-index">{link.index}</span>
                            <span className="subnav-rule" aria-hidden="true">
                              <i />
                            </span>
                            <span className="subnav-label">{link.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={item.id} className={`nav-item${isWorksIndex ? " is-current" : ""}`}>
                  <Link
                    className="nav-link"
                    href="/works"
                    aria-current={isWorksIndex ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className="nav-dot" aria-hidden="true" />
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id} className={`nav-item${isAbout ? " is-current" : ""}`}>
                <Link
                  className="nav-link"
                  href={item.href}
                  aria-current={isAbout ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  <span className="nav-dot" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
