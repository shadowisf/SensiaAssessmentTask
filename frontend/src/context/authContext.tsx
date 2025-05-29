import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userToken: DecodedToken | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  authInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userToken, setUserToken] = useState<DecodedToken | null>(null);

  // check if token is expired
  useEffect(() => {
    async function checkToken() {
      const accessToken = localStorage.getItem("access");

      if (accessToken) {
        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            await refresh();
          } else {
            setIsAuthenticated(true);
            setUserToken(decoded);
          }
        } catch (err) {
          const msg = (err as Error).message;

          console.error(msg);

          logout();
        }

        setAuthInitialized(true);
      }
    }

    checkToken();
  }, []);

  async function refresh() {
    const refresh = localStorage.getItem("refresh");

    if (refresh) {
      try {
        const response = await fetch(
          "http://localhost:8000/api/token/refresh/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to refresh token");
        }

        const data = await response.json();

        login(data.access, data.refresh);
      } catch (err) {
        const msg = (err as Error).message;
        console.error(msg);
      }
    }
  }

  function login(access: string, refresh: string) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    const decoded: DecodedToken = jwtDecode(access);

    setUserToken(decoded);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUserToken(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userToken,
        login,
        logout,
        authInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
