import { createContext, useContext } from "react";

interface AuthContextType {
  userName: string
  loginAction: CallableFunction;
  logOut: CallableFunction;
  authFetch: CallableFunction;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};
