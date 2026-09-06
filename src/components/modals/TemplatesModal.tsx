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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#EFE9E6] relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl text-[#1A1718] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F5] text-[#D84A70] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1718]">Prompt Templates</h2>
              <p className="text-xs text-[#5A5456]">
                Ready-to-use workflows designed for speed, clarity, and precision
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

        {/* Search & Filter Categories */}
        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A39B9E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] outline-none focus:border-[#D84A70] text-[#1A1718] placeholder-[#A39B9E]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#D84A70] text-white shadow-xs"
                    : "bg-[#F8F6F4] text-[#5A5456] hover:bg-[#EFE9E6] hover:text-[#1A1718]"
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
            <div className="text-center py-10 text-xs text-[#A39B9E]">
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
                  className="p-3.5 rounded-xl border border-[#EFE9E6] hover:border-[#D84A70]/50 hover:bg-[#FFFBF8] cursor-pointer transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F8F6F4] text-[#5A5456] group-hover:bg-[#FDF2F5] group-hover:text-[#D84A70] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#1A1718] group-hover:text-[#D84A70] transition-colors">
                        {tpl.title}
                      </h4>
                      <span className="text-[10px] font-medium text-[#7E7779] bg-[#F8F6F4] px-2 py-0.5 rounded-md border border-[#EFE9E6]">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A5456] mt-1 line-clamp-2">
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
