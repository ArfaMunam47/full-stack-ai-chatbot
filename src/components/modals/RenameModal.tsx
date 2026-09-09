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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#32121E]/30 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl text-[#32121E] felt-card-marshmallow">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-2xl felt-btn-marshmallow text-[#8E6F7A] hover:text-[#EC4899] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#FFDFE8] text-[#EC4899] border border-[#FBCFE8]">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-[#32121E]">Rename Conversation</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="felt-card-marshmallow rounded-2xl px-3.5 py-3 mb-5 transition-colors">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Conversation title"
              autoFocus
              className="w-full bg-transparent border-none outline-none text-[#32121E] placeholder-[#B298A1] text-sm font-semibold"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8E6F7A] hover:text-[#32121E] felt-btn-marshmallow transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white felt-btn-pink cursor-pointer active:scale-95 shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
