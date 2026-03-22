import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api  from '../api/axiosClient'

export default function Register() {
  const [name,setName] = useState<string>("");
  const [email,setEmail] = useState<string>("");
  const [password,setPass] = useState<string>("");
  const [error,setError] = useState<string>("");
  const [loading,setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async(e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try{
      await api.post("/auth/register",{
        name,
        email,
        password
      })
      navigate("/login");

    }catch(error){
      setError("Failed to sign up. Try again later."+error)
    }finally{
      setLoading(false);
    }
    
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input 
            type="text" 
            value={name}
            onChange={(e)=>{setName(e.target.value)}}
            required
          />
        </label>
        <label>
          Email:
          <input 
            type="email"
            value={email}
            onChange={(event)=>{setEmail(event.target.value)}}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(event)=>{setPass(event.target.value)}}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading? "Signing Up...":"Sign Up"}
        </button>
      </form>
      {error && <p>{error}</p>}
      
    </div>
  )
}
