import { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

export default function Login({ setAuthToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Connects to our Node.js backend to get the secure token
            const res = await axios.post(`${API_BASE_URL}/api/admin/login`, {
                username,
                password,
            });
            localStorage.setItem('adminToken', res.data.token);
            setAuthToken(res.data.token);
        } catch (err) {
            setError('Invalid Credentials. Access Denied.');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-white mb-2">RGPV Admin</h2>
                <p className="text-gray-400 text-center mb-8">Secure login to manage resources</p>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
