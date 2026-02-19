import React, { useState, useEffect } from 'react';

interface ProjectModalProps {
    isOpen: boolean;
    isSubmitting?: boolean;
    initialName?: string;
    initialDescription?: string;
    onSubmit: (name: string, description: string) => void;
    onClose: () => void;
}

export default function ProjectModal({
                                         isOpen,
                                         isSubmitting = false,
                                         initialName = '',
                                         initialDescription = '',
                                         onSubmit,
                                         onClose,
                                     }: ProjectModalProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);

    // Sync fields when modal opens with initial values (e.g. for editing)
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription);
        }
    }, [isOpen, initialName, initialDescription]);

    if (!isOpen) return null;

    const isEditing = !!(initialName || initialDescription);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, description);
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">
                    {isEditing ? 'Edit Project' : 'Create New Project'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}