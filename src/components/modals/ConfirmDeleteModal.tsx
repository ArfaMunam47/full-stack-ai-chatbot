import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Delete",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] p-6 shadow-xl text-[#2D2626] dark:text-[#F9F4F4]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8E8787] hover:text-[#2D2626] dark:hover:text-[#F9F4F4] hover:bg-[#FFF5F5] dark:hover:bg-[#261F21] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#FFF5F5] dark:bg-[#2D1C1E] text-[#D17A7A] dark:text-[#E28E8E] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight mb-1">{title}</h3>
            <p className="text-sm text-[#8E8787] leading-relaxed mb-6">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#8E8787] hover:text-[#2D2626] dark:hover:text-[#F9F4F4] hover:bg-[#FFF5F5] dark:hover:bg-[#261F21] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-action-btn"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#D17A7A] hover:bg-[#c26d6d] dark:bg-[#E28E8E] dark:text-[#1E1819] transition-colors shadow-2xs"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
