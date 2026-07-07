import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getProfile, type Profile } from "@/lib/store";

/** Loads the profile client-side; redirects to /onboarding when missing. */
export function useRequireProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      void navigate({ to: "/onboarding" });
      return;
    }
    setProfile(p);
    setReady(true);
  }, [navigate]);

  return { profile, ready };
}
