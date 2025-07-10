//Wrap the 'view only after logged in pages' with <RequireAuth> </RequireAuth>
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "./Authentications/tokenValidation";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    
    const checkAuth = () => {
       if (typeof window !== 'undefined') {
            const valid = isTokenValid();
        if (!isTokenValid()) {
          router.replace("/"); // send to home
        } else {
          setChecked(true);
        }
      }

    };

    checkAuth(); // Initial auth check

    // Listen for auth change events (like logout in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [router]);

  // Prevent showing anything until auth check is complete
  if (!checked) return null;

  return <>{children}</>;
};

export default RequireAuth;
