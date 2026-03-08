'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';

import { RoleType } from '@prisma/client';

interface Manager {
  id: number;
  clubId: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{ role: RoleType }>;
  club: {
    id: number;
    name: string;
  };
}

interface MatchResult {
  id: number;
  outcome: string;
  goalsScored: number;
  goalsConceded: number;
  pointsEarned: number;
  match: {
    id: number;
    matchDate: Date;
    tournament: {
      id: number;
      name: string;
    };
    results: Array<{
      id: number;
      outcome: string;
      goalsScored: number;
      goalsConceded: number;
      pointsEarned: number;
      player: {
        id: number;
        name: string;
        photo: string | null;
      };
    }>;
  };
}

interface ManagerProfileProps {
  manager: Manager;
  roleContext?: 'manager' | 'mentor' | 'captain' | 'player';
  listPath?: string;
  matchResults?: MatchResult[];
}

export function ManagerProfile({ manager, roleContext = 'manager', listPath, matchResults = [] }: ManagerProfileProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const roleLabel = roleContext.charAt(0).toUpperCase() + roleContext.slice(1);
  const defaultListPath = `/dashboard/clubs/${manager.clubId}/${roleContext}s`;
  const backPath = listPath || defaultListPath;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/players/${manager.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete ${roleContext}`);
      }

      router.push(backPath);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to delete ${roleContext}`);
      setIsDeleting(false);
      setDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href={backPath}
            className="inline-flex items-center gap-2 text-white hover:text-purple-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {manager.club.name}
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Photo */}
              {manager.photo ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src={manager.photo}
                    alt={manager.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl sm:text-3xl">
                    {manager.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{manager.name}</h1>
                <p className="text-purple-100 text-sm sm:text-base mb-3">
                  Team Member at{' '}
                  <Link
                    href={`/dashboard/clubs/${manager.clubId}`}
                    className="text-white hover:text-purple-100 underline font-medium"
                  >
                    {manager.club.name}
                  </Link>
                </p>
                <div className="flex flex-wrap gap-2">
                  {manager.roles.map((r) => (
                    <span
                      key={r.role}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium"
                    >
                      {r.role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/dashboard/clubs/${manager.clubId}/${roleContext}s/${manager.id}/edit`}>
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </Link>
              <button 
                onClick={() => setDeleteDialog(true)}
                className="px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-600 mt-0.5">Get in touch with this member</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <dl className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                  <dd className="text-sm text-gray-900">
                    <a
                      href={`mailto:${manager.email}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {manager.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Phone Number</dt>
                  <dd className="text-sm text-gray-900">
                    {manager.phone ? (
                      <a
                        href={`tel:${manager.phone}`}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        {manager.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Location</dt>
                  <dd className="text-sm text-gray-900">
                    {manager.place || <span className="text-gray-400 italic">Not specified</span>}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(manager.dateOfBirth)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Additional Information</h2>
                <p className="text-sm text-gray-600 mt-0.5">Membership details and history</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <dl className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Club</dt>
                  <dd className="text-sm text-gray-900">
                    <Link
                      href={`/dashboard/clubs/${manager.clubId}`}
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      {manager.club.name}
                    </Link>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Member Since</dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {formatDate(manager.createdAt)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(manager.updatedAt)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Match Results Section - Only for players */}
      {roleContext === 'player' && matchResults && matchResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Match History</h2>
                <p className="text-sm text-gray-600 mt-0.5">{matchResults.length} {matchResults.length === 1 ? 'match' : 'matches'} played</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {matchResults.map((result) => {
                const opponent = result.match.results.find(r => r.player.id !== manager.id);
                
                return (
                  <div key={result.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                    {/* Match Header */}
                    <div className="bg-gradient-to-r from-gray-100 to-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <Link 
                          href={`/dashboard/tournaments/${result.match.tournament.id}`}
                          className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors"
                        >
                          {result.match.tournament.name}
                        </Link>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(result.match.matchDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>

                    {/* Match Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        {/* Current Player */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {manager.photo ? (
                              <img
                                src={manager.photo}
                                alt={manager.name}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-2 ring-gray-100">
                                <span className="text-lg font-bold text-blue-700">
                                  {manager.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{manager.name}</h4>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                result.outcome === "WIN"
                                  ? "bg-green-100 text-green-800"
                                  : result.outcome === "DRAW"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {result.outcome}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="text-gray-600">{result.goalsScored} scored</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                              <span className="text-gray-600">{result.goalsConceded} conceded</span>
                            </div>
                            <div className="ml-auto">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                {result.pointsEarned} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex flex-col items-center gap-2 px-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">VS</span>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.goalsScored} - {opponent?.goalsScored || 0}
                            </div>
                          </div>
                        </div>

                        {/* Opponent */}
                        {opponent && (
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-row-reverse">
                              {opponent.player.photo ? (
                                <img
                                  src={opponent.player.photo}
                                  alt={opponent.player.name}
                                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ring-2 ring-gray-100">
                                  <span className="text-lg font-bold text-purple-700">
                                    {opponent.player.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0 text-right">
                                <h4 className="font-semibold text-gray-900 truncate">{opponent.player.name}</h4>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  opponent.outcome === "WIN"
                                    ? "bg-green-100 text-green-800"
                                    : opponent.outcome === "DRAW"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {opponent.outcome}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm justify-end">
                              <div className="mr-auto">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                  {opponent.pointsEarned} pts
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-600">{opponent.goalsConceded} conceded</span>
                                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-600">{opponent.goalsScored} scored</span>
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete ${roleLabel}`}
        message={`Are you sure you want to delete "${manager.name}"? This action cannot be undone.`}
        confirmText={`Delete ${roleLabel}`}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
