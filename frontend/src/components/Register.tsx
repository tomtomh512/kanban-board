import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '../api/auth';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const registerMutation = useMutation({
        mutationFn: () => register(email, password, name),
        onSuccess: (user) => {
            queryClient.setQueryData(['user'], user);
            navigate('/dashboard');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {registerMutation.isError && (
                        <p className="text-red-500 text-sm">Registration failed</p>
                    )}
                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {registerMutation.isPending ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </section>
        </div>
    );
}