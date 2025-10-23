import React from 'react';
import type { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`flex items-center p-4 mb-2 border rounded-lg shadow-sm ${bgColor[toast.type]} ${textColor[toast.type]}`}>
      <span className="mr-3 text-lg">{icon[toast.type]}</span>
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastType[]; onClose: (id: string) => void }> = ({
  toasts,
  onClose
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
