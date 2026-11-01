import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight">С возвращением</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="name@example.com"
              required 
            />
          </div>
          
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors mt-4"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}