import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export const useAuthToken = (user: User | null) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
    };

    fetchToken();
  }, [user]);

  return token;
};
