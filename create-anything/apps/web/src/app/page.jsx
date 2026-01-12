import Layout from "../components/layout";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3498DB", "#F39C12", "#E74C3C", "#27AE60"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const stats = data?.stats || { total: 0, open: 0, critical: 0, closed: 0 };
  const recentNc = data?.recentNc || [];

  const kpiCards = [
    {
      title: "Total NC",
      value: stats.total,
      icon: AlertCircle,
      color: "bg-blue-500",
      sub: "Toutes périodes",
    },
    {
      title: "NC Ouvertes",
      value: stats.open,
      icon: Clock,
      color: "bg-orange-500",
      sub: "En attente",
    },
    {
      title: "NC Critiques",
      value: stats.critical,
      icon: AlertCircle,
      color: "bg-red-500",
      sub: "Priorité haute",
    },
    {
      title: "NC Clôturées",
      value: stats.closed,
      icon: CheckCircle2,
      color: "bg-green-500",
      sub: "Traitées",
    },
  ];

  const chartData = [
    { name: "Ouvert", value: parseInt(stats.open) || 0 },
    { name: "Critique", value: parseInt(stats.critical) || 0 },
    { name: "Clos", value: parseInt(stats.closed) || 0 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E50]">
              Tableau de Bord
            </h1>
            <p className="text-[#7F8C8D]">
              Analyse et pilotage DMAIC en temps réel
            </p>
          </div>
          <a
            href="/nc"
            className="flex items-center gap-2 bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
          >
            <Plus size={20} />
            Nouvelle NC
          </a>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm border border-[#E0E0E0] relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-[#7F8C8D]">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold text-[#2C3E50] mt-1">
                    {card.value}
                  </h3>
                  <p className="text-xs text-[#7F8C8D] mt-2">{card.sub}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <card.icon size={24} />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 h-1 bg-current w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ color: card.color.replace("bg-", "#") }}
              ></div>
            </div>
          ))}
        </div>

        {/* Charts & Recent NC */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-[#E0E0E0]">
            <h3 className="text-lg font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#3498DB]" />
              Distribution des NC
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: "#F8F9FA" }} />
                  <Bar dataKey="value" fill="#3498DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E0E0E0]">
            <h3 className="text-lg font-bold text-[#2C3E50] mb-6">
              Répartition par Gravité
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    ></span>
                    <span className="text-[#7F8C8D]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#2C3E50]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#2C3E50]">
              Dernières Non-Conformités
            </h3>
            <a
              href="/nc"
              className="text-[#3498DB] text-sm font-medium hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight size={16} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F9FA] text-[#7F8C8D] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Défaut</th>
                  <th className="px-6 py-4">Gravité</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Déclarant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {recentNc.map((nc) => (
                  <tr
                    key={nc.id}
                    className="hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#2C3E50]">
                      #{nc.id}
                    </td>
                    <td className="px-6 py-4 text-[#2C3E50]">
                      {nc.defect_type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nc.severity === "Critique"
                            ? "bg-red-100 text-red-600"
                            : nc.severity === "Majeure"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {nc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nc.status === "Clos"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {nc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7F8C8D]">
                      {nc.declarant_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
