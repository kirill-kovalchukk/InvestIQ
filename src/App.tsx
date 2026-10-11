import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { Header } from './components/Header';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Calculations } from './pages/Calculations';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<AuthPage />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/calculations"
          element={<Calculations />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;