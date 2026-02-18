import React from 'react';

interface InviteModalProps {
    isOpen: boolean;
    email: string;
    error?: string;
    isSubmitting?: boolean;
    onEmailChange: (email: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    title?: string;
}

export default function InviteModal({
                                        isOpen,
                                        email,
                                        error,
                                        isSubmitting = false,
                                        onEmailChange,
                                        onSubmit,
                                        onClose,
                                        title = 'Invite Member',
                                    }: InviteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">{title}</h3>

                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md
                                       hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Inviting...' : 'Invite'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md
                                       hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
