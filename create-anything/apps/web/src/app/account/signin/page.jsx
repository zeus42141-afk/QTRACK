import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Toaster, toast } from "sonner";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
      toast.success("Connexion réussie !");
    } catch (err) {
      const errorMessages = {
        CredentialsSignin: "Email ou mot de passe incorrect.",
      };
      setError(
        errorMessages[err.message] ||
          "Une erreur est survenue lors de la connexion.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-4">
      <Toaster />
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-[#E0E0E0]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50]">Q-TRACK</h1>
          <p className="text-[#7F8C8D] mt-2">
            Bienvenue sur votre portail qualité
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2C3E50]">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full rounded-lg border border-[#E0E0E0] px-4 py-3 outline-none focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2C3E50]">
              Mot de passe
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#E0E0E0] px-4 py-3 outline-none focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB]"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-[#E74C3C] border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#3498DB] px-4 py-3 text-white font-medium transition-colors hover:bg-[#2980B9] disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-sm text-[#7F8C8D]">
            Pas encore de compte ?{" "}
            <a
              href="/account/signup"
              className="text-[#3498DB] hover:underline"
            >
              S'inscrire
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
