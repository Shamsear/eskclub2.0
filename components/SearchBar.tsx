"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface SearchBarProps {
  className?: string;
}

interface SearchResult {
  clubs: Array<{
    id: number;
    name: string;
    description?: string;
    _count: {
      players: number;
    };
  }>;
  players: Array<{
    id: number;
    name: string;
    email: string;
    place?: string;
    club: {
      id: number;
      name: string;
    };
    roles: Array<{
      id: number;
      role: string;
      createdAt: string;
    }>;
  }>;
}

export default function SearchBar({ className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (type: "club" | "player", id: number) => {
    setIsOpen(false);
    setQuery("");
    if (type === "club") {
      router.push(`/dashboard/clubs/${id}`);
    } else {
      router.push(`/dashboard/players/${id}`);
    }
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "bg-purple-100 text-purple-800";
      case "MENTOR":
        return "bg-blue-100 text-blue-800";
      case "CAPTAIN":
        return "bg-green-100 text-green-800";
      case "PLAYER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalResults = (results?.clubs.length || 0) + (results?.players.length || 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs and members..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results && totalResults > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* Clubs Section */}
          {results.clubs.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Clubs ({results.clubs.length})
              </div>
              {results.clubs.map((club) => (
                <button
                  key={`club-${club.id}`}
                  onClick={() => handleResultClick("club", club.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {club.name}
                      </p>
                      {club.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {club.description}
                        </p>
                      )}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {club._count.players} members
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Players Section */}
          {results.players.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Team Members ({results.players.length})
              </div>
              {results.players.map((player) => (
                <button
                  key={`player-${player.id}`}
                  onClick={() => handleResultClick("player", player.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {player.club ? player.club.name : 'Free Agent'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {player.roles.map((role) => (
                          <span
                            key={role.id}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                              role.role
                            )}`}
                          >
                            {role.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* View All Results */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={handleViewAllResults}
              className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
            >
              View all results ({totalResults})
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && results && totalResults === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-sm text-gray-500 text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
