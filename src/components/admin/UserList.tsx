import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { UserPlus, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface UserListProps {
  users: User[];
  loading: boolean;
  error: Error | null;
  onCreateUser: () => void;
  onSort?: (field: keyof User, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

interface SortConfig {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export function UserList({ 
  users, 
  loading, 
  error, 
  onCreateUser,
  onSort,
  onFilter 
}: UserListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    direction: 'desc'
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    role: '',
    subscription_tier: ''
  });

  const handleSort = (field: keyof User) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
    onSort?.(field, direction);
  };

  const handleFilter = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleRowSelect = (userId: string) => {
    const newSelected = new Set(selectedRows);
    if (selectedRows.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === users.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(users.map(user => user.id)));
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filters.role === '' || user.role === filters.role;
      const matchesTier = filters.subscription_tier === '' || 
        user.subscription_tier === filters.subscription_tier;

      return matchesSearch && matchesRole && matchesTier;
    });
  }, [users, searchTerm, filters]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error.message}
      </div>
    );
  }

  const renderSortIcon = (field: keyof User) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-indigo-600" />
      : <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={filters.role}
            onChange={(e) => handleFilter('role', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.subscription_tier}
            onChange={(e) => handleFilter('subscription_tier', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Tiers</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>

          <Button onClick={onCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                {[
                  { key: 'email', label: 'Email' },
                  { key: 'first_name', label: 'First Name' },
                  { key: 'last_name', label: 'Last Name' },
                  { key: 'role', label: 'Role' },
                  { key: 'subscription_tier', label: 'Subscription' },
                  { key: 'created_at', label: 'Created At' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(key as keyof User)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {renderSortIcon(key as keyof User)}
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr 
                    key={user.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(user.id)}
                        onChange={() => handleRowSelect(user.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.first_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        {
                          basic: 'bg-gray-100 text-gray-800',
                          pro: 'bg-blue-100 text-blue-800',
                          premium: 'bg-green-100 text-green-800'
                        }[user.subscription_tier]
                      }`}>
                        {user.subscription_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user.id}`);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRows.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedRows.size} user{selectedRows.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedRows(new Set())}>
                Cancel
              </Button>
              <Button>
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}