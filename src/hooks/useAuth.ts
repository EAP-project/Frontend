import { useState } from "react";
import { User } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return { user, login, logout };
}
