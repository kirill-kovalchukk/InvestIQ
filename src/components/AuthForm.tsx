import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // если вход успешный
    navigate('/dashboard');
  };

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Перевірте пошту для підтвердження');
    }
  };

  return (
    <div className="auth-card">
      <p className="auth-text">
        Ви можете авторизуватися за допомогою
        <br />
        акаунта Google
      </p>

      <button
        type="button"
        className="google-button"
        onClick={handleGoogle}
      >
        <span className="google-icon">G</span>
        Google
      </button>

      <p className="auth-text second-text">
        Або увійти за допомогою ел. пошти та
        <br />
        паролю після реєстрації
      </p>

      <form onSubmit={handleLogin}>
        <label>Електронна пошта:</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />

        <label>Пароль:</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="auth-buttons">
          <button type="submit" className="login-button">
            УВІЙТИ
          </button>

          <button
            type="button"
            className="register-button"
            onClick={handleRegister}
          >
            РЕЄСТРАЦІЯ
          </button>
        </div>
      </form>
    </div>
  );
};