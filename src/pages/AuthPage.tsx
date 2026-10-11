import { AuthForm } from '../components/AuthForm';

export const AuthPage = () => {
  return (
    <main className="auth-page">
      <section className="hero">

        <div className="brand">
          <h1>InvestIQ</h1>
          <p>SMART FINANCE</p>
        </div>

        <AuthForm />

      </section>
    </main>
  );
};