import { X } from 'lucide-react';
import { useUIStore } from '../stores';

interface ModalProps {
  id: string;
  title: string;
  width?: number;
  children: React.ReactNode;
}

export default function Modal({ id, title, width = 600, children }: ModalProps) {
  const activeModal = useUIStore((s) => s.activeModal);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  if (activeModal !== id) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveModal(null);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="modal-content" style={{ width }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" aria-label="关闭" onClick={() => setActiveModal(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
