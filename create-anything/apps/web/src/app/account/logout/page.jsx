import useAuth from "@/utils/useAuth";
import { useEffect } from "react";

function MainComponent() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  }, [signOut]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3498DB] border-t-transparent mx-auto mb-4"></div>
        <p className="text-[#2C3E50]">Déconnexion en cours...</p>
      </div>
    </div>
  );
}

export default MainComponent;
