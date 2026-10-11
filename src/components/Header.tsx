import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();

    const { data } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate('/');
  };

  const getUserName = () => {
    if (!user) {
      return '';
    }

    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }

    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }

    return user.email?.split('@')[0] || 'User Name';
  };

  const userName = getUserName();

  return (
    <header className="header">

    <div className="header-logo">
  <div className="invest-logo-icon">
    <div className="invest-logo-circle"></div>
    <div className="invest-logo-box"></div>
  </div>

  <span className="invest-logo-text">
    INVESTIQ
  </span>
</div>

      {user && (
        <div className="header-user">

          <div className="user-avatar">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          <span className="user-name">
            {userName}
          </span>

          <div className="header-divider"></div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Вийти
          </button>

        </div>
      )}

    </header>
  );
};