import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  History,
  LogOut,
  SearchCheck,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Analysis",
    to: "/new-analysis",
    icon: SearchCheck,
  },
  {
    label: "Resumes",
    to: "/resumes",
    icon: FileText,
  },
  {
    label: "Jobs",
    to: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Analysis History",
    to: "/analysis-history",
    icon: History,
  },
];

export default function AppShell({
  title,
  subtitle,
  children,
  theme,
  toggleTheme,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-950/40">
                <span className="text-lg font-bold">M</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  MatchLens
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ATS Match Workspace
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-600/90 to-blue-500/80 text-white shadow-lg shadow-indigo-200/40 dark:shadow-indigo-950/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || "No email"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleTheme}
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </>
                  )}
                </Button>

                <div className="hidden rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 sm:block dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  Logged in
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}