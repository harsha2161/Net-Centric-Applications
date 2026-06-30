import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowseProjects from './pages/BrowseProjects';
import AdminDashboard from './pages/AdminDashboard';
import StudentsDashbourd from './pages/StudentsDashbourd';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/projects" element={<BrowseProjects/>} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/studentsdashbourd" element={<StudentsDashbourd/>} />
      </Routes>
    </Router>
  );
}

export default App;
