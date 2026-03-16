import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type SiteKey = "cikarang" | "pulogadung" | "all";

interface SiteContextType {
  /** The active site filter. Admin can change; users get their profile site. */
  activeSite: SiteKey;
  setActiveSite: (site: SiteKey) => void;
  /** User's own site from profile (null for admin without profile site) */
  userSite: string | null;
  /** Whether the user can change the site selector */
  canChangeSite: boolean;
  /** Labels for display */
  siteLabel: (key: string) => string;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const LABELS: Record<string, string> = {
  cikarang: "Cikarang",
  pulogadung: "Pulogadung",
  all: "Semua Site",
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const { userRole, userSite } = useAuth();
  const isAdmin = userRole === "admin";

  const [activeSite, setActiveSite] = useState<SiteKey>("all");

  // Non-admin: lock to their profile site
  useEffect(() => {
    if (!isAdmin && userSite) {
      setActiveSite(userSite as SiteKey);
    }
  }, [isAdmin, userSite]);

  const siteLabel = (key: string) => LABELS[key] ?? key;

  return (
    <SiteContext.Provider
      value={{
        activeSite,
        setActiveSite: isAdmin ? setActiveSite : () => {},
        userSite,
        canChangeSite: isAdmin,
        siteLabel,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
