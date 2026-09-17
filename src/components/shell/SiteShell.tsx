import { ArrowIcon } from "@/components/shell/ArrowIcon";
import { Sidebar } from "@/components/shell/Sidebar";
import { getNavbar } from "@/lib/data";

type SiteShellProps = {
  children: React.ReactNode;
  workName?: string;
};

export function SiteShell({ children, workName }: SiteShellProps) {
  const navbar = getNavbar();

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <a className="start-btn" href="#contact">
        Start a project
        <ArrowIcon />
      </a>

      <div className="shell">
        <Sidebar navbar={navbar} workName={workName} />
        <main className="main">{children}</main>
      </div>
    </>
  );
}
