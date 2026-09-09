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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#32121E]/30 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl text-[#32121E] felt-card-marshmallow">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-2xl felt-btn-marshmallow text-[#8E6F7A] hover:text-[#EC4899] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-[#EC4899] shrink-0 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold leading-tight mb-1 text-[#32121E]">{title}</h3>
            <p className="text-sm text-[#8E6F7A] leading-relaxed mb-6 font-medium">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8E6F7A] hover:text-[#32121E] felt-btn-marshmallow cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-action-btn"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
