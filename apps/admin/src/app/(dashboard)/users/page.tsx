'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  subscription: string;
  joinedAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', email: 'john@example.com', role: 'USER', status: 'ACTIVE', subscription: 'Pro', joinedAt: '2025-01-15', lastLogin: '2 hours ago' },
  { id: '2', email: 'jane@example.com', role: 'USER', status: 'ACTIVE', subscription: 'Basic', joinedAt: '2025-03-20', lastLogin: '5 min ago' },
  { id: '3', email: 'admin@appi-vpn.com', role: 'ADMIN', status: 'ACTIVE', subscription: 'Premium', joinedAt: '2024-12-01', lastLogin: '1 min ago' },
  { id: '4', email: 'bob@example.com', role: 'USER', status: 'BANNED', subscription: 'None', joinedAt: '2025-06-10', lastLogin: '30 days ago' },
  { id: '5', email: 'alice@example.com', role: 'USER', status: 'SUSPENDED', subscription: 'Trial', joinedAt: '2025-11-01', lastLogin: '1 hour ago' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === 'all' || u.role === roleFilter) &&
      (statusFilter === 'all' || u.status === statusFilter),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'BANNED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-muted-foreground">Manage platform users</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.subscription}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {user.joinedAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                        Edit
                      </button>
                      {user.status === 'ACTIVE' ? (
                        <button className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                          Ban
                        </button>
                      ) : (
                        <button className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
