'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface PointSystemTemplate {
  id: number;
  name: string;
  description: string | null;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  pointsPerGoalScored: number;
  pointsPerGoalConceded: number;
  _count: {
    tournaments: number;
    conditionalRules: number;
  };
}

interface PointSystemsListProps {
  initialTemplates: PointSystemTemplate[];
}

export function PointSystemsList({ initialTemplates }: PointSystemsListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PointSystemTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    router.push(`/dashboard/point-systems?${params.toString()}`);
  };

  const handleDeleteClick = (template: PointSystemTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/point-systems/${templateToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        // Keep dialog open to show the error message
        showToast(data.error || 'Failed to delete template', 'error');
        setIsDeleting(false);
        return;
      }

      showToast('Template deleted successfully', 'success');
      setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name..."
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first point system template'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/point-systems/new">
                <button className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Template
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/point-systems/${template.id}/edit`}>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-300">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(template)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Points Grid */}
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {[
                    { label: 'Win', value: template.pointsPerWin, gradient: 'from-green-500 to-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Draw', value: template.pointsPerDraw, gradient: 'from-yellow-500 to-orange-600', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Loss', value: template.pointsPerLoss, gradient: 'from-red-500 to-pink-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Goal +', value: template.pointsPerGoalScored, gradient: 'from-blue-500 to-cyan-600', icon: 'M12 4v16m8-8H4' },
                    { label: 'Goal -', value: template.pointsPerGoalConceded, gradient: 'from-purple-500 to-indigo-600', icon: 'M20 12H4' },
                  ].map((point, idx) => (
                    <div key={idx} className="relative overflow-hidden bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-purple-300 transition-all">
                      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${point.gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${point.gradient} rounded-lg flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={point.icon} />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{point.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{point.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-semibold">{template._count.tournaments}</span>
                    <span>tournament{template._count.tournaments !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="font-semibold">{template._count.conditionalRules}</span>
                    <span>rule{template._count.conditionalRules !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Point System Template"
        message={
          templateToDelete
            ? templateToDelete._count.tournaments > 0
              ? `This template is currently assigned to ${templateToDelete._count.tournaments} tournament${
                  templateToDelete._count.tournaments !== 1 ? 's' : ''
                }. Deleting it will remove the association, but tournaments will keep their current point configurations.`
              : `Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
