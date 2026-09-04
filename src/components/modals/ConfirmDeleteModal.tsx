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
      <div className="tactile-card relative w-full max-w-md rounded-3xl p-6 shadow-2xl text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#F5EFEB] dark:bg-[#1E140C] text-[#9E3624] dark:text-[#F0806E] shrink-0 border border-[#DDD1C2] dark:border-[#3E291C]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight mb-1 text-[#1F130B] dark:text-[#FAF6F0]">{title}</h3>
            <p className="text-sm text-[#543D2B] dark:text-[#D8C9BC] leading-relaxed mb-6 font-normal">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="tactile-raised px-4 py-2 rounded-xl text-xs font-semibold text-[#543D2B] dark:text-[#D8C9BC] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-action-btn"
            onClick={onConfirm}
            className="tactile-espresso px-4 py-2 rounded-xl text-xs font-semibold text-[#FAF6F0] shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
