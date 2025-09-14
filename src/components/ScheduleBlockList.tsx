import React, { useState } from 'react';
import type { ScheduleBlock, ScheduleBlockType } from '../lib/types';
import ScheduleBlockForm from './ScheduleBlockForm';

interface ScheduleBlockListProps {
  scheduleBlocks: ScheduleBlock[];
  onUpdate: (id: string, updates: Partial<ScheduleBlock>) => void;
  onDelete: (id: string) => void;
  onCreate: (scheduleBlock: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  userId: string;
}

const TYPE_LABELS: Record<ScheduleBlockType, string> = {
  work: 'Work',
  sleep: 'Sleep',
  personal: 'Personal',
  travel: 'Travel',
  meal: 'Meals',
  exercise: 'Exercise',
  family: 'Family',
  study: 'Study',
  other: 'Other'
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export default function ScheduleBlockList({ 
  scheduleBlocks, 
  onUpdate, 
  onDelete, 
  onCreate, 
  userId 
}: ScheduleBlockListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | undefined>();
  const [filterType, setFilterType] = useState<ScheduleBlockType | 'all'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const handleEdit = (scheduleBlock: ScheduleBlock) => {
    setEditingBlock(scheduleBlock);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingBlock(undefined);
    setShowForm(true);
  };

  const handleFormSave = async (scheduleBlockData: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBlock) {
      await onUpdate(editingBlock.id, scheduleBlockData);
    } else {
      await onCreate(scheduleBlockData);
    }
    setShowForm(false);
    setEditingBlock(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBlock(undefined);
  };

  const handleToggleActive = async (scheduleBlock: ScheduleBlock) => {
    await onUpdate(scheduleBlock.id, { isActive: !scheduleBlock.isActive });
  };

  const handleDelete = async (scheduleBlock: ScheduleBlock) => {
    if (window.confirm(`Are you sure you want to delete "${scheduleBlock.title}"?`)) {
      await onDelete(scheduleBlock.id);
    }
  };

  // Filter schedule blocks
  const filteredBlocks = scheduleBlocks.filter(block => {
    if (filterType !== 'all' && block.type !== filterType) return false;
    if (filterActive === 'active' && !block.isActive) return false;
    if (filterActive === 'inactive' && block.isActive) return false;
    return true;
  });

  // Group by type for better organization
  const groupedBlocks = filteredBlocks.reduce((groups, block) => {
    if (!groups[block.type]) {
      groups[block.type] = [];
    }
    groups[block.type].push(block);
    return groups;
  }, {} as Record<ScheduleBlockType, ScheduleBlock[]>);

  if (showForm) {
    return (
      <ScheduleBlockForm
        scheduleBlock={editingBlock}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
        userId={userId}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Blocks</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Schedule Block
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="typeFilter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ScheduleBlockType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="activeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="activeFilter"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Schedule Blocks List */}
      {filteredBlocks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule blocks found</h3>
          <p className="text-gray-500 mb-4">
            {filterType === 'all' && filterActive === 'all' 
              ? "Create your first schedule block to get started"
              : "No schedule blocks match your current filters"
            }
          </p>
          {(filterType === 'all' && filterActive === 'all') && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create Schedule Block
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBlocks).map(([type, blocks]) => (
            <div key={type} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: blocks[0]?.color || '#6b7280' }}
                />
                {TYPE_LABELS[type as ScheduleBlockType]} ({blocks.length})
              </h3>
              
              <div className="grid gap-4">
                {blocks.map(block => (
                  <div
                    key={block.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      block.isActive 
                        ? 'bg-white border-gray-200 hover:border-gray-300' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {block.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            PRIORITY_COLORS[block.priority]
                          }`}>
                            {block.priority}
                          </span>
                          {!block.isActive && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>⏰ {block.startTime} - {block.endTime}</span>
                            <span>📅 {block.daysOfWeek.map(day => {
                              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              return dayNames[day];
                            }).join(', ')}</span>
                          </div>
                          
                          {block.description && (
                            <p className="text-gray-500">{block.description}</p>
                          )}
                          
                          {(block.bufferBefore > 0 || block.bufferAfter > 0) && (
                            <div className="text-xs text-gray-500">
                              Buffer: {block.bufferBefore > 0 && `-${block.bufferBefore}min`} 
                              {block.bufferBefore > 0 && block.bufferAfter > 0 && ', '}
                              {block.bufferAfter > 0 && `+${block.bufferAfter}min`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(block)}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            block.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {block.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(block)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(block)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
