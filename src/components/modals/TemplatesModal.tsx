import React, { useState } from "react";
import { X, Sparkles, Code, PenTool, BarChart3, Lightbulb, Compass, Search } from "lucide-react";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string) => void;
}

interface TemplateItem {
  id: string;
  category: "Coding" | "Writing" | "Analysis" | "Productivity";
  title: string;
  description: string;
  prompt: string;
  icon: any;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "explain-code",
    category: "Coding",
    title: "Explain Complex Code",
    description: "Break down code line-by-line with architectural explanations and complexity analysis.",
    prompt: "Please explain this code snippet in simple terms, highlighting key concepts, time/space complexity, and potential edge cases:\n\n[PASTE CODE HERE]",
    icon: Code,
  },
  {
    id: "refactor-clean",
    category: "Coding",
    title: "Refactor for Clean Code",
    description: "Modernize code following clean architecture, readability, and performance standards.",
    prompt: "Refactor this code to make it more readable, modular, and maintainable. Explain what changes were made and why:\n\n[PASTE CODE HERE]",
    icon: Code,
  },
  {
    id: "sql-optimization",
    category: "Coding",
    title: "SQL Query Optimization",
    description: "Optimize slow queries with indexing strategies and execution plan tips.",
    prompt: "Analyze and optimize this SQL query for high concurrency and lower latency:\n\n[PASTE SQL QUERY HERE]",
    icon: Code,
  },
  {
    id: "professional-email",
    category: "Writing",
    title: "Executive Email Draft",
    description: "Draft high-impact, polished professional emails for clients or executives.",
    prompt: "Draft a concise, polite, and persuasive email addressing the following situation with professional composure:\n\n[DESCRIBE SITUATION]",
    icon: PenTool,
  },
  {
    id: "technical-documentation",
    category: "Writing",
    title: "API Documentation",
    description: "Generate comprehensive API docs with request/response schemas and curl examples.",
    prompt: "Generate clear API documentation in Markdown format including endpoint description, parameters, example request payload, and sample responses for:\n\n[DESCRIBE ENDPOINT]",
    icon: PenTool,
  },
  {
    id: "swot-analysis",
    category: "Analysis",
    title: "SWOT Business Analysis",
    description: "Evaluate Strengths, Weaknesses, Opportunities, and Threats for any project.",
    prompt: "Conduct an in-depth SWOT analysis for the following product or initiative with actionable strategic recommendations:\n\n[DESCRIBE PRODUCT OR BUSINESS]",
    icon: BarChart3,
  },
  {
    id: "data-insights",
    category: "Analysis",
    title: "Data Trend Extrapolation",
    description: "Extract actionable patterns, anomalies, and metrics from raw metrics.",
    prompt: "Analyze the following dataset or metrics to highlight key trends, anomalies, and top 3 priorities for action:\n\n[PASTE DATA OR METRICS HERE]",
    icon: BarChart3,
  },
  {
    id: "study-schedule",
    category: "Productivity",
    title: "Sprint Study / Learning Plan",
    description: "Generate a structured 2-week mastery roadmap with daily milestones.",
    prompt: "Create a rigorous, structured 14-day study plan to master the fundamentals of [TOPIC], including daily reading, practical drills, and self-assessment tests.",
    icon: Lightbulb,
  },
  {
    id: "meeting-agenda",
    category: "Productivity",
    title: "Focused Meeting Agenda",
    description: "Set tight agendas with timeboxes, objectives, and discussion checkpoints.",
    prompt: "Create a 30-minute structured meeting agenda designed to achieve consensus on:\n\n[MEETING GOAL]",
    icon: Compass,
  },
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const categories = ["All", "Coding", "Writing", "Analysis", "Productivity"];

  const filtered = TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === "All" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Prompt Templates</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ready-to-use workflows designed for speed and clarity
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

        {/* Search & Filter Categories */}
        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-neutral-900 dark:focus:border-neutral-400 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-neutral-400">
              No templates found matching "{search}"
            </div>
          ) : (
            filtered.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl.prompt);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/70 cursor-pointer transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white">
                        {tpl.title}
                      </h4>
                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
