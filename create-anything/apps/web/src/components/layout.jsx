import React, { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
} from "lucide-react";
import useUser from "@/utils/useUser";
import { Toaster } from "sonner";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: user, loading } = useUser();

  const navItems = [
    { name: "Tableau de Bord", icon: LayoutDashboard, href: "/" },
    { name: "Opérations Qualité", icon: ClipboardList, href: "/nc" },
    { name: "Analyse & Pilotage", icon: BarChart3, href: "/analysis" },
    { name: "Système & Audit", icon: ShieldCheck, href: "/audit" },
    { name: "Rapports", icon: FileText, href: "/reports" },
    { name: "Paramètres", icon: Settings, href: "/settings" },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside
        className={`bg-[#2C3E50] text-white fixed h-full z-20 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="text-xl font-bold tracking-wider">Q-TRACK</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-4 hover:bg-[#34495E] transition-colors group relative"
            >
              <item.icon size={22} className="min-w-[22px]" />
              {isSidebarOpen && <span className="ml-4">{item.name}</span>}
              {!isSidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10">
          <a
            href="/account/logout"
            className="flex items-center px-6 py-4 hover:bg-[#E74C3C] transition-colors group relative"
          >
            <LogOut size={22} className="min-w-[22px]" />
            {isSidebarOpen && <span className="ml-4">Déconnexion</span>}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-[#E0E0E0] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#2C3E50]">
              Management de la Qualité
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-[#7F8C8D] hover:text-[#2C3E50] relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[#E74C3C] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-[#E0E0E0]">
              <div className="text-right">
                <p className="text-sm font-medium text-[#2C3E50]">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-[#7F8C8D]">Admin Qualité</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3498DB] flex items-center justify-center text-white">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
