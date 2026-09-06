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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white relative w-full max-w-md rounded-2xl p-6 shadow-2xl text-[#1A1718] border border-[#EFE9E6]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-[#FDF2F5] text-[#D84A70] border border-[#F5C4D2]">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-[#1A1718]">Rename Conversation</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-[#F8F6F4] border border-[#EFE9E6] focus-within:border-[#D84A70] rounded-xl px-3.5 py-2.5 mb-5 transition-colors">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Conversation title"
              autoFocus
              className="w-full bg-transparent border-none outline-none text-[#1A1718] placeholder-[#A39B9E] text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A5456] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer border border-[#EFE9E6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D84A70] hover:bg-[#C0375D] cursor-pointer active:scale-95 shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
