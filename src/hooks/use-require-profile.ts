import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getProfile, type Profile } from "@/lib/store";

/** Loads the profile client-side; redirects to /onboarding when missing. */
export function useRequireProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsProfile, setNeedsProfile] = useState(true);
  const [ready, setReady] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      setProfile(null);
      setNeedsProfile(true);
      setReady(true);
      void navigate({ to: "/parents", replace: true });
      return;
    }

    setProfile(p);
    setNeedsProfile(false);
    setReady(true);
  }, [navigate]);

  return { profile, ready, needsProfile };
}
