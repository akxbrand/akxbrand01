'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import Toast from '@/components/ui/Toast';
import { PenSquare, Trash2 } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  status: string;
  startDate: Date;
  endDate?: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: '',
    startDate: '',
    endDate: '',
    priority: 0
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const { success, announcements: data, error } = await response.json();
      if (!success) throw new Error(error || 'Failed to fetch announcements');
      setAnnouncements(data);
    } catch (error: any) {
      showToastMessage(error.message || 'Error fetching announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      message: announcement.message,
      startDate: new Date(announcement.startDate).toISOString().slice(0, 16),
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : '',
      priority: announcement.priority
    });
    setIsAddFormVisible(true);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        const response = await fetch(`/api/admin/announcements/${editingAnnouncement.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newAnnouncement,
            id: editingAnnouncement.id
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to update announcement');
        }

        showToastMessage('Announcement updated successfully');
        await fetchAnnouncements();
        setIsAddFormVisible(false);
        setEditingAnnouncement(null);
        setNewAnnouncement({
          message: '',
          startDate: '',
          endDate: '',
          priority: 0
        });
      } else {
        const response = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnnouncement),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create announcement');
        }

        showToastMessage('Announcement created successfully');
      }

      await fetchAnnouncements();
      setIsAddFormVisible(false);
      setEditingAnnouncement(null);
      setNewAnnouncement({
        message: '',
        startDate: '',
        endDate: '',
        priority: 0
      });
    } catch (error: any) {
      showToastMessage(error.message || 'Error managing announcement', 'error');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}/toggle`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle announcement status');
      }

      await fetchAnnouncements();
      showToastMessage('Announcement status updated successfully');
    } catch (error: any) {
      showToastMessage(error.message || 'Error updating announcement status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete announcement');
      }

      await fetchAnnouncements();
      showToastMessage('Announcement deleted successfully');
    } catch (error: any) {
      showToastMessage(error.message || 'Error deleting announcement', 'error');
    }
  };

  return (
    <AdminLayout title="Announcements Page">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={true}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Manage Announcements</h2>
          <button
            onClick={() => {
              setIsAddFormVisible(!isAddFormVisible);
              if (!isAddFormVisible) {
                setEditingAnnouncement(null);
                setNewAnnouncement({
                  message: '',
                  startDate: '',
                  endDate: '',
                  priority: 0
                });
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isAddFormVisible ? 'Cancel' : 'Add Announcement'}
          </button>
        </div>

        {isAddFormVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white shadow sm:rounded-lg p-6"
          >
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="mt-1 text-gray-700 resize-none block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    required
                    value={newAnnouncement.startDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, startDate: e.target.value })}
                    className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={newAnnouncement.endDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, endDate: e.target.value })}
                    className="mt-1 block text-gray-700 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <input
                    type="number"
                    id="priority"
                    required
                    min="0"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: parseInt(e.target.value) })}
                    className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFormVisible(false);
                    setEditingAnnouncement(null);
                    setNewAnnouncement({
                      message: '',
                      startDate: '',
                      endDate: '',
                      priority: 0
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {editingAnnouncement ? 'Save Changes' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No announcements found</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <motion.li
                  key={announcement.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {announcement.message}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>Priority: {announcement.priority}</span>
                        <span>•</span>
                        <span>
                          {new Date(announcement.startDate).toLocaleDateString()}
                          {announcement.endDate && ` - ${new Date(announcement.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleStatusToggle(announcement.id, announcement.status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${announcement.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} hover:bg-opacity-75 transition-colors duration-200`}
                      >
                        {announcement.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}