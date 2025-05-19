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
    const sections = content.split(/(?=##? )/);
    
    return sections.map((section, index) => {
      // Check if section starts with a header
      if (section.startsWith('## ')) {
        // Level 2 header (subsection)
        const headerText = section.split('\n')[0].replace('## ', '');
        const content = section.split('\n').slice(1).join('\n');
        
        return (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-bold text-[#0A192F] mb-3">
              {headerText}
            </h3>
            {formatTextWithStyles(content)}
          </div>
        );
      } else if (section.startsWith('# ')) {
        // Level 1 header (main section)
        const headerText = section.split('\n')[0].replace('# ', '');
        const content = section.split('\n').slice(1).join('\n');
        
        return (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">
              {headerText}
            </h2>
            {formatTextWithStyles(content)}
          </div>
        );
      } else {
        // Regular content
        return (
          <div key={index} className="mb-4">
            {formatTextWithStyles(section)}
          </div>
        );
      }
    });
  };

  const formatTextWithStyles = (text: string) => {
    // Process inline styles and LaTeX
    return text.split(/(\*\*.*?\*\*|\*.*?\*|\$.*?\$|\n- |\n\d+\. )/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        // Italic text
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // LaTeX formula
        const latex = part.slice(1, -1);
        return <InlineMath key={i} math={latex} />;
      } else if (part.startsWith('\n- ')) {
        // Bullet point
        return (
          <ul key={i} className="ml-4 my-2">
            <li className="list-disc">{part.slice(3)}</li>
          </ul>
        );
      } else if (/^\n\d+\.\s/.test(part)) {
        const match = part.match(/\d+/);
        const number = match ? parseInt(match[0], 10) : 1; // default to 1 if no match
      
        return (
          <ol key={i} className="ml-4 my-2" start={number}>
            <li className="list-decimal">{part.slice(match[0].length + 3).trim()}</li>
          </ol>
        );
      }else {
        // Regular text with paragraph breaks
        return part.split('\n\n').map((paragraph, j) => (
          paragraph.trim() && (
            <p key={`${i}-${j}`} className="mb-2">
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
              p-4 rounded-lg
              ${isUser 
                ? 'bg-[#172A46] text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'}
            `}
          >
            <div className="prose prose-sm max-w-none">
              {formatContent(message.content)}
            </div>
            <div 
              className={`
                text-xs mt-3 pt-2 border-t
                ${isUser ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'}
              `}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
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