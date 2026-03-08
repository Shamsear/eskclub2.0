"use client";

import { useEffect } from "react";
import { logError } from "@/lib/errors";
import Link from "next/link";

/**
 * Error page for tournament routes - catches errors in tournament pages
 */
export default function TournamentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error when it occurs
    logError(error, { digest: error.digest, page: "tournaments" });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Tournament Error
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We encountered an error while loading tournament data. This might be due to a network issue or invalid data.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mb-4 p-4 bg-gray-100 rounded text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/dashboard/tournaments"
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium"
          >
            Back to Tournaments
          </Link>
          <Link
            href="/dashboard"
            className="w-full text-gray-600 hover:text-gray-800 px-4 py-2 text-center text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
