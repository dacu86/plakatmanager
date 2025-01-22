// src/pages/Projects.tsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Plus, Calendar, Users, MapPin } from 'lucide-react';
import { Project } from '@/types';
import { ProjectModal } from '@/components/projects/ProjectModal';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery('projects', async () => {
    // Hier später die API-Abfrage implementieren
    return [];
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
