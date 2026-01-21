"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserSession } from "@/lib/user-auth";

interface UserSessionContextType {
  session: UserSession;
}

const UserSessionContext = createContext<UserSessionContextType | null>(null);

interface UserSessionProviderProps {
  children: ReactNode;
  session: UserSession;
}

export function UserSessionProvider({ children, session }: UserSessionProviderProps) {
  return (
    <UserSessionContext.Provider value={{ session }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  
  if (!context) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  
  return context.session;
}
