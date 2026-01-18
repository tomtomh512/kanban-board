import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logout, checkAuth } from '../api/auth';
import { getMyProjects, getInvitedProjects, createProject, addMember } from '../api/projects';
import InviteModal from '../components/InviteModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: checkAuth,
    });

    const { data: myProjects = [] } = useQuery({
        queryKey: ['myProjects'],
        queryFn: getMyProjects,
    });

    const { data: invitedProjects = [] } = useQuery({
        queryKey: ['invitedProjects'],
        queryFn: getInvitedProjects,
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(['user'], null);
            navigate('/login');
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: () => createProject(projectName, projectDescription),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
            setShowCreateModal(false);
            setProjectName('');
            setProjectDescription('');
        },
    });

    const inviteMutation = useMutation({
        mutationFn: () => addMember(selectedProjectId!, inviteEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteError('');
        },
        onError: (error: Error) => {
            setInviteError(error.message);
        },
    });

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        createProjectMutation.mutate();
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        inviteMutation.mutate();
    };

    const openInviteModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setShowInviteModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold">Project Manager</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">{user?.name}</span>
                            <button
                                onClick={() => logoutMutation.mutate()}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">My Projects</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            + Create Project
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myProjects.map((project) => (
                            <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                                <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700">Members: {project.members.length}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {project.members.map((member) => (
                                            <span key={member.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {member.name}
                      </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/project/${project.id}`)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 text-sm font-medium"
                                    >
                                        Open Board
                                    </button>
                                    <button
                                        onClick={() => openInviteModal(project.id)}
                                        className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 text-sm font-medium"
                                    >
                                        Invite
                                    </button>
                                </div>
                            </div>
                        ))}
                        {myProjects.length === 0 && (
                            <p className="text-gray-500 col-span-full text-center py-8">
                                No projects created by you yet.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Invited Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitedProjects.map((project) => (
                            <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                                <p className="text-gray-600 mb-2 text-sm">{project.description}</p>
                                <p className="text-sm text-gray-500">Owner: {project.owner.name}</p>
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700">Members: {project.members.length}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {project.members.map((member) => (
                                            <span key={member.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {member.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/project/${project.id}`)}
                                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 text-sm font-medium"
                                >
                                    Open Board
                                </button>
                            </div>
                        ))}
                        {invitedProjects.length === 0 && (
                            <p className="text-gray-500 col-span-full text-center py-8">
                                No invited projects yet.
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Create New Project</h3>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={createProjectMutation.isPending}
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showInviteModal && (
                <InviteModal
                    isOpen={showInviteModal}
                    email={inviteEmail}
                    error={inviteError}
                    isSubmitting={inviteMutation.isPending}
                    onEmailChange={setInviteEmail}
                    onSubmit={handleInviteMember}
                    onClose={() => {
                        setShowInviteModal(false);
                        setInviteEmail('');
                        setInviteError('');
                    }}
                />
            )}
        </div>
    );
}