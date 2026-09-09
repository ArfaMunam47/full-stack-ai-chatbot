import React, { useState, useEffect } from "react";
import { X, BookOpen, Plus, Trash2, CheckCircle2, Shield } from "lucide-react";
import { api } from "../../lib/api.ts";
import { MemoryItem } from "../../types.ts";

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [category, setCategory] = useState<MemoryItem["category"]>("preference");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  const loadMemories = async () => {
    try {
      const list = await api.getMemories();
      setMemories(list);
    } catch (err) {
      console.error("Failed to load memories:", err);
    }
  };

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const added = await api.addMemory(category, content.trim());
      setMemories((prev) => [added, ...prev]);
      setContent("");
      setSuccessNotice("Knowledge point remembered!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      console.error("Failed to add memory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#32121E]/30 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl text-[#32121E] felt-card-marshmallow flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFDFE8] text-[#EC4899] flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#32121E]">Personal Knowledge & Memory</h2>
              <p className="text-xs text-[#8E6F7A] font-medium">
                Teach ARFA AI facts, preferences, or conventions to remember across chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl felt-btn-marshmallow text-[#8E6F7A] hover:text-[#EC4899] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Knowledge Input */}
        <form onSubmit={handleAdd} className="pt-4 pb-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="text-xs px-3 py-2.5 rounded-2xl felt-btn-marshmallow text-[#32121E] outline-none font-bold cursor-pointer"
            >
              <option value="preference">Preference</option>
              <option value="fact">Fact</option>
              <option value="project">Project Context</option>
              <option value="instruction">System Rule</option>
            </select>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. I prefer TypeScript and React for all frontend solutions..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl felt-card-marshmallow outline-none text-[#32121E] placeholder-[#B298A1] font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-4 py-2.5 rounded-2xl felt-btn-pink text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {successNotice && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successNotice}</span>
            </div>
          )}
        </form>

        {/* Knowledge List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {memories.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#B298A1] font-medium">
              No saved knowledge yet. Add rules or personal preferences above!
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl felt-card-marshmallow flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EC4899] bg-[#FFDFE8] border border-[#FBCFE8] px-2 py-0.5 rounded-lg">
                    {m.category}
                  </span>
                  <p className="text-xs text-[#32121E] font-medium mt-1">{m.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#B298A1] hover:text-rose-500 transition-all p-1 cursor-pointer"
                  title="Remove knowledge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-[#EFE6DC] flex items-center gap-2 text-[11px] text-[#8E6F7A] font-medium">
          <Shield className="w-3.5 h-3.5 text-[#EC4899]" />
          <span>Knowledge is private and only used to personalize your responses.</span>
        </div>
      </div>
    </div>
  );
};
