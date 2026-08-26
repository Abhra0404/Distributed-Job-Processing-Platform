import {
  Activity,
  Briefcase,
  Plus,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  {
    name: "Overview",
    path: "/",
    icon: Activity,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Submit Job",
    path: "/submit",
    icon: Plus,
  },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-zinc-800/80 bg-[#0c0c0e]">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-zinc-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Activity className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                Distributed Jobs
              </p>

              <p className="text-[11px] text-zinc-500">
                Processing Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Platform
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/70 px-3 py-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />

            <div>
              <p className="text-xs font-medium text-zinc-300">
                System operational
              </p>

              <p className="text-[10px] text-zinc-600">
                All services available
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-[#09090b]/90 px-8 backdrop-blur-xl">
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Job Processing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600">
              API
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-xs text-zinc-500">
              Connected
            </span>
          </div>
        </header>

        <main className="px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}