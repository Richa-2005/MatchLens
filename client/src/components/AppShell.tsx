import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  History,
  LogOut,
  SearchCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
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
    icon: SearchCheck 
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
}: AppShellProps) {

  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
      
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-950/40">
                <span className="text-lg font-bold">M</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">MatchLens</h2>
                <p className="text-sm text-slate-400">ATS Match Workspace</p>
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
                      ? "bg-gradient-to-r from-indigo-600/90 to-blue-500/80 text-white shadow-lg shadow-indigo-950/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 px-4 py-4">
            <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-sm font-medium text-slate-100">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.email || "No email"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

       
        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
       
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-50">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                  )}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 sm:block">
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