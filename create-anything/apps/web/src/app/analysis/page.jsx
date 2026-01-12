import Layout from "../../components/layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AnalysisPage() {
  const [selectedNc, setSelectedNc] = useState(null);
  const [analysisMethod, setAnalysisMethod] = useState("5_pourquoi");
  const [whySteps, setWhySteps] = useState(["", "", "", "", ""]);
  const [ishikawaData, setIshikawaData] = useState({
    main: "",
    milieu: "",
    methode: "",
    materiel: "",
    matiere: "",
  });
  const [isActionFormOpen, setIsActionFormOpen] = useState(false);
  const [expandedNc, setExpandedNc] = useState(null);

  const queryClient = useQueryClient();

  // Récupérer les NC ouvertes
  const { data: ncList = [] } = useQuery({
    queryKey: ["nc-open"],
    queryFn: async () => {
      const res = await fetch("/api/nc?status=Ouvert");
      if (!res.ok) throw new Error("Failed to fetch NC");
      return res.json();
    },
  });

  // Récupérer les analyses de causes
  const { data: analyses = [] } = useQuery({
    queryKey: ["cause-analyses"],
    queryFn: async () => {
      const res = await fetch("/api/cause-analysis");
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return res.json();
    },
  });

  // Récupérer les actions correctives
  const { data: actions = [] } = useQuery({
    queryKey: ["corrective-actions"],
    queryFn: async () => {
      const res = await fetch("/api/corrective-actions");
      if (!res.ok) throw new Error("Failed to fetch actions");
      return res.json();
    },
  });

  // Créer une analyse de causes
  const createAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/cause-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create analysis");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cause-analyses"] });
      setSelectedNc(null);
      setWhySteps(["", "", "", "", ""]);
      setIshikawaData({
        main: "",
        milieu: "",
        methode: "",
        materiel: "",
        matiere: "",
      });
      toast.success("Analyse enregistrée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Créer une action corrective
  const createActionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/corrective-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create action");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      setIsActionFormOpen(false);
      toast.success("Action corrective créée et email envoyé");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleSubmitAnalysis = () => {
    if (!selectedNc) {
      toast.error("Sélectionnez une NC");
      return;
    }

    let rootCause = "";
    if (analysisMethod === "5_pourquoi") {
      const filledSteps = whySteps.filter((s) => s.trim());
      if (filledSteps.length === 0) {
        toast.error("Remplissez au moins un pourquoi");
        return;
      }
      rootCause = filledSteps
        .map((step, i) => `Pourquoi ${i + 1}: ${step}`)
        .join("\n");
    } else {
      rootCause = `Main-d'œuvre: ${ishikawaData.main}\nMilieu: ${ishikawaData.milieu}\nMéthode: ${ishikawaData.methode}\nMatériel: ${ishikawaData.materiel}\nMatière: ${ishikawaData.matiere}`;
    }

    createAnalysisMutation.mutate({
      nc_id: selectedNc,
      method: analysisMethod === "5_pourquoi" ? "5 Pourquoi" : "Ishikawa",
      root_cause: rootCause,
    });
  };

  const handleSubmitAction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createActionMutation.mutate({
      nc_id: parseInt(formData.get("nc_id")),
      description: formData.get("description"),
      responsible: formData.get("responsible"),
      deadline_days: parseInt(formData.get("deadline_days")),
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50]">
            Analyse & Pilotage
          </h1>
          <p className="text-[#7F8C8D]">
            Analyse des causes racines et actions correctives
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyse des causes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E0E0E0]">
            <h2 className="text-lg font-bold text-[#2C3E50] mb-4">
              Nouvelle Analyse de Causes
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                  Sélectionner une NC
                </label>
                <select
                  value={selectedNc || ""}
                  onChange={(e) => setSelectedNc(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                >
                  <option value="">Choisir une NC...</option>
                  {ncList.map((nc) => (
                    <option key={nc.id} value={nc.id}>
                      NC #{nc.id} - {nc.defect_type} ({nc.severity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                  Méthode d'analyse
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAnalysisMethod("5_pourquoi")}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      analysisMethod === "5_pourquoi"
                        ? "bg-[#3498DB] text-white border-[#3498DB]"
                        : "bg-white text-[#2C3E50] border-[#E0E0E0] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    5 Pourquoi
                  </button>
                  <button
                    onClick={() => setAnalysisMethod("ishikawa")}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      analysisMethod === "ishikawa"
                        ? "bg-[#3498DB] text-white border-[#3498DB]"
                        : "bg-white text-[#2C3E50] border-[#E0E0E0] hover:bg-[#F8F9FA]"
                    }`}
                  >
                    Ishikawa (5M)
                  </button>
                </div>
              </div>

              {analysisMethod === "5_pourquoi" ? (
                <div className="space-y-3">
                  {whySteps.map((step, index) => (
                    <div key={index}>
                      <label className="text-sm text-[#7F8C8D] block mb-1">
                        Pourquoi {index + 1} ?
                      </label>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...whySteps];
                          newSteps[index] = e.target.value;
                          setWhySteps(newSteps);
                        }}
                        className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                        placeholder="Entrez la cause..."
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {["main", "milieu", "methode", "materiel", "matiere"].map(
                    (category) => (
                      <div key={category}>
                        <label className="text-sm text-[#7F8C8D] block mb-1 capitalize">
                          {category === "main" ? "Main-d'œuvre" : category}
                        </label>
                        <input
                          type="text"
                          value={ishikawaData[category]}
                          onChange={(e) =>
                            setIshikawaData({
                              ...ishikawaData,
                              [category]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                          placeholder={`Cause liée au ${category}...`}
                        />
                      </div>
                    ),
                  )}
                </div>
              )}

              <button
                onClick={handleSubmitAnalysis}
                disabled={!selectedNc || createAnalysisMutation.isPending}
                className="w-full px-4 py-3 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors disabled:opacity-50 font-medium"
              >
                {createAnalysisMutation.isPending
                  ? "Enregistrement..."
                  : "Enregistrer l'analyse"}
              </button>
            </div>
          </div>

          {/* Actions correctives */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E0E0E0]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#2C3E50]">
                Actions Correctives
              </h2>
              <button
                onClick={() => setIsActionFormOpen(true)}
                className="flex items-center gap-2 bg-[#27AE60] text-white px-3 py-1.5 rounded-lg hover:bg-[#229954] transition-colors text-sm"
              >
                <Plus size={16} />
                Nouvelle
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {actions.length === 0 ? (
                <p className="text-[#7F8C8D] text-center py-8">
                  Aucune action corrective
                </p>
              ) : (
                actions.map((action) => {
                  const daysSinceCreation = Math.floor(
                    (new Date() - new Date(action.created_at)) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isLate =
                    daysSinceCreation > action.deadline_days &&
                    action.status !== "Terminé";

                  return (
                    <div
                      key={action.id}
                      className={`p-4 rounded-lg border ${
                        isLate
                          ? "bg-red-50 border-red-300"
                          : "bg-[#F8F9FA] border-[#E0E0E0]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2C3E50]">
                            NC #{action.nc_id} - {action.defect_type}
                          </p>
                          <p className="text-xs text-[#7F8C8D] mt-1">
                            {action.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-[#7F8C8D]">
                              Responsable: {action.responsible}
                            </span>
                            <span
                              className={
                                isLate
                                  ? "text-red-600 font-medium"
                                  : "text-[#7F8C8D]"
                              }
                            >
                              Délai: {action.deadline_days}j
                              {isLate &&
                                ` (⚠️ ${daysSinceCreation - action.deadline_days}j de retard)`}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            action.status === "Terminé"
                              ? "bg-green-100 text-green-700"
                              : action.status === "En cours"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {action.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Historique des analyses */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E0E0E0]">
            <h2 className="text-lg font-bold text-[#2C3E50]">
              Historique des Analyses
            </h2>
          </div>
          <div className="divide-y divide-[#E0E0E0]">
            {analyses.length === 0 ? (
              <p className="text-[#7F8C8D] text-center py-8">
                Aucune analyse enregistrée
              </p>
            ) : (
              analyses.map((analysis) => (
                <div key={analysis.id} className="p-6">
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() =>
                      setExpandedNc(
                        expandedNc === analysis.id ? null : analysis.id,
                      )
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {expandedNc === analysis.id ? (
                          <ChevronDown className="text-[#3498DB]" size={20} />
                        ) : (
                          <ChevronRight className="text-[#7F8C8D]" size={20} />
                        )}
                        <div>
                          <p className="font-medium text-[#2C3E50]">
                            NC #{analysis.nc_id} - {analysis.defect_type}
                          </p>
                          <p className="text-sm text-[#7F8C8D]">
                            {analysis.workstation} • {analysis.method} •{" "}
                            {new Date(analysis.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedNc === analysis.id && (
                    <div className="mt-4 ml-8 p-4 bg-[#F8F9FA] rounded-lg">
                      <p className="text-sm font-medium text-[#2C3E50] mb-2">
                        Cause(s) racine(s) identifiée(s) :
                      </p>
                      <pre className="text-sm text-[#7F8C8D] whitespace-pre-wrap">
                        {analysis.root_cause}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal nouvelle action corrective */}
        {isActionFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F8F9FA]">
                <h3 className="text-xl font-bold text-[#2C3E50]">
                  Nouvelle Action Corrective
                </h3>
                <button
                  onClick={() => setIsActionFormOpen(false)}
                  className="text-[#7F8C8D] hover:text-[#2C3E50]"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmitAction} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                    NC concernée
                  </label>
                  <select
                    name="nc_id"
                    required
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {ncList.map((nc) => (
                      <option key={nc.id} value={nc.id}>
                        NC #{nc.id} - {nc.defect_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                    Description de l'action
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none resize-none"
                    placeholder="Décrivez l'action corrective à mettre en place..."
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                    Responsable (Email)
                  </label>
                  <input
                    name="responsible"
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2C3E50] block mb-2">
                    Délai (en jours)
                  </label>
                  <input
                    name="deadline_days"
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#3498DB] outline-none"
                    placeholder="Ex: 7"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActionFormOpen(false)}
                    className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createActionMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#229954] transition-colors disabled:opacity-50"
                  >
                    {createActionMutation.isPending
                      ? "Envoi..."
                      : "Créer et Notifier"}
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
