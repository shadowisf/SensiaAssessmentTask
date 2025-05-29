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
  user_id: number;
  email: string;
  username: string;
  is_superuser?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: DecodedToken | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  authInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          logout();
        } else {
          setIsAuthenticated(true);
          setUser(decoded);
        }
      } catch (err) {
        console.error("Invalid token format:", err);
        logout();
      }
    }
    setAuthInitialized(true); // ✅ mark it initialized
  }, []);

  function login(access: string, refresh: string) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    const decoded: DecodedToken = jwtDecode(access);

    setUser(decoded);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
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
