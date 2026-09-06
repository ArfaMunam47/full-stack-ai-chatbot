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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#EFE9E6] relative w-full max-w-xl rounded-2xl p-6 shadow-2xl text-[#1A1718] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F5] text-[#D84A70] flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1718]">Personal Knowledge & Memory</h2>
              <p className="text-xs text-[#5A5456]">
                Teach ARFA AI facts, preferences, or coding conventions to remember across chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
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
              className="text-xs px-2.5 py-2 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] text-[#5A5456] outline-none cursor-pointer"
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
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] outline-none focus:border-[#D84A70] text-[#1A1718] placeholder-[#A39B9E]"
            />
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#D84A70] hover:bg-[#C0375D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {successNotice && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successNotice}</span>
            </div>
          )}
        </form>

        {/* Knowledge List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {memories.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#A39B9E]">
              No saved knowledge yet. Add rules or personal preferences above!
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D84A70] bg-[#FDF2F5] border border-[#F7CDD8] px-2 py-0.5 rounded-md">
                    {m.category}
                  </span>
                  <p className="text-xs text-[#1A1718]">{m.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#A39B9E] hover:text-red-500 transition-all p-1 cursor-pointer"
                  title="Remove knowledge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-[#EFE9E6] flex items-center gap-2 text-[11px] text-[#A39B9E]">
          <Shield className="w-3.5 h-3.5 text-[#7E7779]" />
          <span>Knowledge is private and only used to personalize your responses.</span>
        </div>
      </div>
    </div>
  );
};
