import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isLoggedIn: boolean;
    user: any;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (token) {
                setIsLoggedIn(true);
                if (storedUser) setUser(JSON.parse(storedUser));
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const login = async (token: string, userData: any) => {
        await AsyncStorage.multiSet([
            ['accessToken', token],
            ['token', token],
            ['user', JSON.stringify(userData)],
        ]);
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await AsyncStorage.multiRemove(['accessToken', 'token', 'user']);
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            isLoggedIn: false,
            user: null,
            login: async () => {},
            logout: async () => {},
            loading: false,
        };
    }
    return context;
};