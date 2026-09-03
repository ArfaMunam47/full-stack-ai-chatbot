import React, { useState, useEffect } from "react";
import { Edit3, X } from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  initialTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  initialTitle,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] p-6 shadow-xl text-[#2D2626] dark:text-[#F9F4F4]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8E8787] hover:text-[#2D2626] dark:hover:text-[#F9F4F4] hover:bg-[#FFF5F5] dark:hover:bg-[#261F21]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#FFF5F5] dark:bg-[#2D1C1E] text-[#D17A7A] dark:text-[#E28E8E]">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold">Rename Conversation</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Conversation title"
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5E1E1] dark:border-[#35292B] bg-[#FFF9F9] dark:bg-[#161213] text-[#2D2626] dark:text-[#F9F4F4] text-sm focus:outline-none focus:border-[#D17A7A] mb-5"
          />

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#8E8787] hover:text-[#2D2626] dark:hover:text-[#F9F4F4] hover:bg-[#FFF5F5] dark:hover:bg-[#261F21]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#D17A7A] hover:bg-[#c26d6d] dark:bg-[#E28E8E] dark:text-[#1E1819] disabled:opacity-50 transition-colors shadow-2xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
