"use client";

import Image from "next/image";
import { User } from "@/types";

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            Email Scheduler
          </span>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name + Email */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 leading-none">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="ml-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 transition-colors"
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
