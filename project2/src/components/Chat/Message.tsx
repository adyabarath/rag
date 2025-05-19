import React from 'react';
import { Message as MessageType } from '../../types';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MessageProps {
  message: MessageType;
  isFirstMessage?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isFirstMessage }) => {
  const isUser = message.role === 'user';

  const formatContent = (content: string) => {
    if (isUser) return content;

    // Split content into sections based on markdown-style headers
    const sections = content.split(/(?=# |## )/);
    
    return sections.map((section, index) => {
      // Check if section starts with a main header (h1)
      if (section.startsWith('# ')) {
        const headerText = section.split('\n')[0].replace('# ', '');
        const content = section.split('\n').slice(1).join('\n');
        
        return (
          <div key={index} className="mb-6">
            <h1 className="text-2xl font-bold text-[#0A192F] mb-4 pb-3 border-b border-gray-200">
              {headerText}
            </h1>
            <div className="space-y-4">{formatTextWithStyles(content)}</div>
          </div>
        );
      } 
      // Check if section starts with a subheader (h2)
      else if (section.startsWith('## ')) {
        const headerText = section.split('\n')[0].replace('## ', '');
        const content = section.split('\n').slice(1).join('\n');
        
        return (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-semibold text-[#0A192F] mb-3">
              {headerText}
            </h2>
            <div className="space-y-2">{formatTextWithStyles(content)}</div>
          </div>
        );
      } else {
        // Regular content without header
        return (
          <div key={index} className="mb-4">
            {formatTextWithStyles(section)}
          </div>
        );
      }
    });
  };

  const formatTextWithStyles = (text: string) => {
    // Split text into parts that need different formatting
    return text.split(/(\*\*.*?\*\*|\*.*?\*|\$.*?\$|\n• |\n\d+\. )/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        return (
          <strong key={i} className="font-semibold text-[#0A192F]">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        // Italic text
        return (
          <em key={i} className="text-gray-600">
            {part.slice(1, -1)}
          </em>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // LaTeX formula
        const latex = part.slice(1, -1);
        return <InlineMath key={i} math={latex} />;
      } else if (part.startsWith('\n• ')) {
        // Bullet point
        return (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <span className="text-gray-400 mt-1">•</span>
            <span className="flex-1">{part.slice(3)}</span>
          </div>
        );
      } else if (/^\n\d+\.\s/.test(part)) {
        // Numbered list
        const match = part.match(/\d+/);
        const number = match ? parseInt(match[0], 10) : 1;
        return (
          <div key={i} className="flex items-start gap-3 py-0.5">
            <span className="text-gray-600 font-medium min-w-[1.25rem]">{number}.</span>
            <span className="flex-1">{part.slice(match[0].length + 3)}</span>
          </div>
        );
      } else {
        // Regular text with paragraph breaks
        return part.split('\n\n').map((paragraph, j) => (
          paragraph.trim() && (
            <p key={`${i}-${j}`} className="text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          )
        ));
      }
    });
  };

  return (
    <div className={`animate-fadeIn ${isFirstMessage ? '' : 'mt-6'}`}>
      <div className="flex items-start gap-3">
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold">AI</span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">
            {isUser ? 'You' : 'Assistant'}
          </div>
          <div 
            className={`
              p-6 rounded-lg
              ${isUser 
                ? 'bg-[#172A46] text-white rounded-tr-none' 
                : 'bg-white shadow-sm border border-gray-200 text-gray-800 rounded-tl-none'}
            `}
          >
            <div className="prose prose-sm max-w-none">
              {formatContent(message.content)}
            </div>
          </div>
          <div 
            className={`
              text-xs mt-2
              ${isUser ? 'text-gray-400' : 'text-gray-500'}
            `}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold">U</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;