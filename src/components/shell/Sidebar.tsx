"use client";

import Link from "next/link";
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
  const isHome = pathname === "/";
  const isWorksIndex = pathname === "/works";
  const isWorkDetail = pathname.startsWith("/works/") && pathname !== "/works";
  const isAbout = pathname === "/about";

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
          aria-expanded="false"
          aria-label="Open menu"
        >
          <span className="menu-toggle-mark" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <nav className="nav" id="site-nav" aria-label="Primary">
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
