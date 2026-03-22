import { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email,setEmail] = useState<string>("");
    const [password,setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string>("");
    
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        
        try{
            await auth.login(email,password);
            navigate("/dashboard");

        }catch(error){
            setError("Invalid email or password");

        }finally{
            setLoading(false);
        }

    }
  return (
    <div>
        <form onSubmit = {handleSubmit}>
            <label>
                Email:
                <input type="email" value={email} onChange={(event) => setEmail(event?.target.value)} required/> 
            </label>
            <label>
                Password:
                <input type="password" value={password} onChange={(event) => setPassword(event?.target.value)} required/> 
            </label>
            <button type="submit" disabled={loading}>
                {loading? "Logging in..." : "Login"}
            </button>
        </form>
        {error && <p >{error}</p>}
    </div>
  )
}
