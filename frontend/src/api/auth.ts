import { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    return data.user;
}

export async function register(
    email: string,
    password: string,
    name: string
): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    const data = await response.json();
    return data.user;
}

export async function logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function checkAuth(): Promise<User | null> {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch {
        return null;
    }
}