import {useContext, useEffect, createContext,useState} from 'react';
import type { ReactNode } from 'react';
import api from '../api/axiosClient';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
    user: User |null,
    token: string | null,
    login: (email : string,password : string)=> Promise<void>,
    logout: ()=> void,
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : { children: ReactNode }) =>{
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user,setUser] = useState< User |null>(null);
    
    useEffect(()=>{
        if(token){
            api.get('/auth/me')
            .then(response => {
                setUser(response.data);
                
            })
            .catch(()=>{
                localStorage.removeItem('token');
                setToken(null);
                setUser(null); 
            });
        }else{
            setUser(null);
        }
    },[token]);

    const login = async(email : string, password : string):Promise<void> => {
        
        const response = await api.post('/auth/login',{
            email,
            password
        });

        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        
    }

    const logout = ():void => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        
    }
    
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user,token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};