import React, { useState, useEffect } from 'react';
import { Card, UserSummary } from '../types';

interface CardModalProps {
    isOpen: boolean;
    editingCard?: Card | null;
    members: UserSummary[];
    isSubmitting?: boolean;
    onSubmit: (data: { title: string; description: string; link: string; assigneeIds: string[] }) => void;
    onClose: () => void;
}

export default function CardModal({
                                      isOpen,
                                      editingCard = null,
                                      members,
                                      isSubmitting = false,
                                      onSubmit,
                                      onClose,
                                  }: CardModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

    useEffect(() => {
        if (editingCard) {
            setTitle(editingCard.title);
            setDescription(editingCard.description || '');
            setLink(editingCard.link || '');
            setAssigneeIds(editingCard.assignees.map(a => a.id));
        } else {
            setTitle('');
            setDescription('');
            setLink('');
            setAssigneeIds([]);
        }
    }, [editingCard, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, description, link, assigneeIds });
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setLink('');
        setAssigneeIds([]);
        onClose();
    };

    const toggleAssignee = (id: string, checked: boolean) => {
        setAssigneeIds(prev =>
            checked ? [...prev, id] : prev.filter(a => a !== id)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                    {editingCard ? 'Edit Card' : 'Create New Card'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Link</label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Assign Members</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                            {members.map((member) => (
                                <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={assigneeIds.includes(member.id)}
                                        onChange={(e) => toggleAssignee(member.id, e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">{member.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {editingCard ? 'Update' : 'Create'}
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