import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import { checkAuth } from './api/auth';

function App() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: checkAuth,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-xl">Loading...</span>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" /> : <Login />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to="/dashboard" /> : <Register />}
                />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                    path="/project/:projectId"
                    element={user ? <ProjectBoard /> : <Navigate to="/login" />}
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;