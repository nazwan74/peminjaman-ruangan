import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Router>
  );
}

export default App;