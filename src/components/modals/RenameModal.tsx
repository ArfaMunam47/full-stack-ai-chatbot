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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="tactile-card relative w-full max-w-md rounded-3xl p-6 shadow-2xl text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] text-[#2E1B10] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-[#1F130B] dark:text-[#FAF6F0]">Rename Conversation</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tactile-recessed rounded-xl px-3.5 py-2.5 mb-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Conversation title"
              autoFocus
              className="w-full bg-transparent border-none outline-none text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584] text-sm"
            />
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
              type="submit"
              className="tactile-espresso px-4 py-2 rounded-xl text-xs font-semibold text-[#FAF6F0] cursor-pointer active:scale-95 shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
