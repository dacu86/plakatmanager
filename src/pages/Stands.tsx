// src/pages/Stands.tsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Plus, Search, Filter } from 'lucide-react';
import { Stand } from '@/types';
import { StandModal } from '@/components/stands/StandModal';
import { StandMap } from '@/components/StandMap';
import { Input } from '@/components/ui/input';

export default function StandsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data: stands, isLoading } = useQuery('stands', async () => {
    // Hier später die API-Abfrage implementieren
    return [];
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredStands = stands?.filter(stand => {
    const matchesSearch = 
      stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'ALL' || stand.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditStand = (stand: Stand) => {
    setSelectedStand(stand);
    setIsModalOpen(true);
  };

  const handleCreateStand = () => {
    setSelectedStand(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dreiecksständer</h1>
        <Button onClick={handleCreateStand}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Ständer
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Suchen..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="pl-10 pr-8 py-2 border rounded appearance-none bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Alle Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="MAINTENANCE">Wartung</option>
            <option value="INACTIVE">Inaktiv</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standliste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Ständer Liste</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredStands?.map(stand => (
              <div
                key={stand.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedStand?.id === stand.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedStand(stand)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{stand.name}</h3>
                    <p className="text-sm text-gray-500">
                      {stand.location.address}
                    </p>
                    {stand.currentPoster && (
                      <p className="text-sm text-gray-600 mt-1">
                        Aktuell: {stand.currentPoster}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stand.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : stand.status === 'MAINTENANCE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {stand.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Karte */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="h-[600px]">
            <StandMap
              stands={filteredStands || []}
              onStandSelect={setSelectedStand}
            />
          </div>
        </div>
      </div>

      <StandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stand={selectedStand}
      />
    </div>
  );
}
