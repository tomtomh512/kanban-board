import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addMember, removeMember, deleteProject } from '../api/projects';

export function useProjectActions(projectId: string) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');

    const inviteMutation = useMutation({
        mutationFn: () => addMember(projectId, inviteEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
            setInviteEmail('');
            setInviteError('');
        },
        onError: (error: Error) => {
            setInviteError(error.message);
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: string) => removeMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: () => deleteProject(projectId),
        onSuccess: () => navigate('/dashboard'),
    });

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        inviteMutation.mutate();
    };

    const handleRemoveMember = (userId: string) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            removeMemberMutation.mutate(userId);
        }
    };

    const handleDeleteProject = () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            deleteProjectMutation.mutate();
        }
    };

    return {
        inviteEmail,
        setInviteEmail,
        inviteError,
        setInviteError,
        isInviting: inviteMutation.isPending,
        handleInviteMember,
        handleRemoveMember,
        handleDeleteProject,
    };
}