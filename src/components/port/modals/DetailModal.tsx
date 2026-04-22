import React from 'react';
import { X } from 'lucide-react';
import './detail-modal.css';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function DetailModal({ isOpen, onClose, title, children }: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal__header">
          <h3>{title}</h3>
          <button className="detail-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="detail-modal__content">
          {children}
        </div>
      </div>
    </div>
  );
}
