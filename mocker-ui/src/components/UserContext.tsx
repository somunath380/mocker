// UserContext.tsx
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface UserContextType {
  user: any; // Adjust the type according to your user data structure
  setUser: Dispatch<SetStateAction<any>>; // Adjust the type according to your user data structure
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext; // Exporting the context itself
