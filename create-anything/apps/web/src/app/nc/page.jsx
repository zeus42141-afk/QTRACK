import Layout from "../../components/layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreVertical, X } from "lucide-react";
import { toast } from "sonner";

export default function NCOperationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ncList = [], isLoading } = useQuery({
    queryKey: ["nc-list"],
    queryFn: async () => {
      const res = await fetch("/api/nc");
      if (!res.ok) throw new Error("Failed to fetch NC");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newNc) => {
      const res = await fetch("/api/nc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNc),
      });
      if (!res.ok) throw new Error("Failed to create NC");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nc-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setIsFormOpen(false);
      toast.success("Non-Conformité déclarée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      defect_type: formData.get("defect_type"),
      workstation: formData.get("workstation"),
      severity: formData.get("severity"),
      description: formData.get("description"),
    };
    createMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E50]">
              Opérations Qualité
            </h1>
            <p className="text-[#7F8C8D]">
              Déclaration et registre des non-conformités
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
          >
            <Plus size={20} />
            Déclarer une NC
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E0E0E0] flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7F8C8D]"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher une NC, un poste..."
              className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-lg outline-none focus:border-[#3498DB]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] transition-colors text-[#2C3E50]">
              <Filter size={18} />
              Filtres
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F9FA] text-[#7F8C8D] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Défaut</th>
                  <th className="px-6 py-4">Poste</th>
                  <th className="px-6 py-4">Gravité</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td
                          colSpan="7"
                          className="px-6 py-4 bg-gray-50 h-12"
                        ></td>
                      </tr>
                    ))
                  : ncList.map((nc) => (
                      <tr
                        key={nc.id}
                        className="hover:bg-[#F8F9FA] transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-[#2C3E50]">
                          #{nc.id}
                        </td>
                        <td className="px-6 py-4 text-[#7F8C8D] text-sm">
                          {new Date(nc.date_nc).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-[#2C3E50]">
                          {nc.defect_type}
                        </td>
                        <td className="px-6 py-4 text-[#2C3E50]">
                          {nc.workstation}
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
                        <td className="px-6 py-4">
                          <button className="text-[#7F8C8D] hover:text-[#2C3E50]">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F8F9FA]">
                <h3 className="text-xl font-bold text-[#2C3E50]">
                  Déclarer une Non-Conformité
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-[#7F8C8D] hover:text-[#2C3E50]"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#2C3E50]">
                      Type de défaut
                    </label>
                    <input
                      name="defect_type"
                      required
                      className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                      placeholder="Ex: Rayure, Erreur côte..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#2C3E50]">
                      Poste de travail
                    </label>
                    <input
                      name="workstation"
                      required
                      className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                      placeholder="Ex: Montage, Peinture..."
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#2C3E50]">
                    Gravité
                  </label>
                  <select
                    name="severity"
                    required
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none appearance-none bg-white"
                  >
                    <option value="Mineure">Mineure</option>
                    <option value="Majeure">Majeure</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#2C3E50]">
                    Description détaillée
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none resize-none"
                    placeholder="Décrivez le problème rencontré..."
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending
                      ? "Enregistrement..."
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
