"use client";

import React, { useState } from 'react';
import { CustomerStatus } from '@/types/customer';
import { Check, Ban, AlertCircle } from 'lucide-react';

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  onStatusChange: (newStatus: CustomerStatus, reason?: string) => void;
}

export default function CustomerStatusBadge({ status, onStatusChange }: CustomerStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>(status);
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return <Check className="w-4 h-4" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4" />;
      case 'banned':
        return <Ban className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleStatusSelect = (newStatus: CustomerStatus) => {
    setSelectedStatus(newStatus);
    if (newStatus !== 'active') {
      setShowReasonInput(true);
    } else {
      handleStatusChange(newStatus);
    }
  };

  const handleStatusChange = (newStatus: CustomerStatus) => {
    onStatusChange(newStatus, reason);
    setIsOpen(false);
    setShowReasonInput(false);
    setReason('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        <span className="mr-1">{getStatusIcon(status)}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {(['active', 'blocked', 'banned'] as CustomerStatus[]).map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleStatusSelect(statusOption)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  statusOption === selectedStatus ? 'bg-gray-100' : ''
                } hover:bg-gray-50 flex items-center`}
              >
                <span className="mr-2">{getStatusIcon(statusOption)}</span>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showReasonInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reason for {selectedStatus === 'blocked' ? 'blocking' : 'banning'} user
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder={`Please provide a reason for ${selectedStatus === 'blocked' ? 'blocking' : 'banning'} this user...`}
              required
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReasonInput(false);
                  setIsOpen(false);
                  setSelectedStatus(status);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={!reason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
