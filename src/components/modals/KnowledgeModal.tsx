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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 relative w-full max-w-xl rounded-2xl p-6 shadow-2xl text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Personal Knowledge & Memory</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Teach ARFA AI facts, preferences, or coding conventions to remember across chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
              className="text-xs px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 outline-none"
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
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-neutral-900 dark:focus:border-neutral-400 text-neutral-900 dark:text-neutral-100"
            />
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {successNotice && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successNotice}</span>
            </div>
          )}
        </form>

        {/* Knowledge List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {memories.length === 0 ? (
            <div className="text-center py-10 text-xs text-neutral-400">
              No saved knowledge yet. Add rules or personal preferences above!
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-md">
                    {m.category}
                  </span>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200">{m.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-1 cursor-pointer"
                  title="Remove knowledge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-2 text-[11px] text-neutral-400">
          <Shield className="w-3.5 h-3.5 text-neutral-500" />
          <span>Knowledge is private and only used to personalize your responses.</span>
        </div>
      </div>
    </div>
  );
};
