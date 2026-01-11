"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UserContextType {
  userId: Id<"users"> | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  user: null,
  isLoading: true,
  error: null,
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll use a default user
  const defaultEmail = "demo@whatsapp-bulk.com";
  const defaultName = "Demo User";

  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create or get the demo user
        const newUserId = await createOrGetUser({
          email: defaultEmail,
          name: defaultName,
        });
        
        setUserId(newUserId);
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [createOrGetUser]);

  return (
    <UserContext.Provider value={{ userId, user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}