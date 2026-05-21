import { onAuthStateChanged, signOut } from "firebase/auth"; // Added signOut import
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Added the actual logout function here
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase SignOut Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    // Added logout into the Provider's value object here
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Check your _layout.jsx!",
    );
  }

  return context;
}
