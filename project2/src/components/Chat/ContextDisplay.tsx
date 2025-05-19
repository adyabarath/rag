import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { RetrievedContext } from '../../types';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ContextDisplayProps {
  contexts?: RetrievedContext[];
  isOpen: boolean;
  onToggle: () => void;
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({ contexts, isOpen, onToggle }) => {
  const [expandedContexts, setExpandedContexts] = useState<string[]>([]);

  if (!contexts || contexts.length === 0) return null;

  const toggleContext = (id: string) => {
    setExpandedContexts(prev => 
      prev.includes(id) 
        ? prev.filter(contextId => contextId !== id)
        : [...prev, id]
    );
  };

  const formatContent = (content: string) => {
    // Split content into parts that should be rendered as LaTeX and regular text
    const parts = content.split(/(\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const latex = part.slice(1, -1);
        return <InlineMath key={index} math={latex} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      <div 
        className={`
          fixed top-16 right-0 h-[calc(100vh-4rem)] bg-white shadow-lg
          transition-transform duration-300 ease-in-out transform
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-96 z-30
        `}
      >
        <button
          onClick={onToggle}
          className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-l-lg p-2 hover:bg-gray-50 transition-colors"
          aria-label={isOpen ? "Hide context" : "Show context"}
        >
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-[#0A192F] text-white">
            <div className="flex items-center gap-2">
              <BookOpen size={20} />
              <h2 className="font-semibold text-lg">Retrieved Context</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {contexts.map((context, index) => (
                <div 
                  key={context.id}
                  className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => toggleContext(context.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A192F] text-white text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0A192F]">
                          {context.source}
                        </span>
                        <span className="text-xs text-[#0A192F] font-medium">
                          {(context.relevanceScore * 100).toFixed(1)}% match
                        </span>
                      </div>
                    </div>
                    {expandedContexts.includes(context.id) ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedContexts.includes(context.id) && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                          {formatContent(context.content)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ContextDisplay;