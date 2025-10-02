'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content || content.trim() === '') {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>این مستند محتوایی ندارد</p>
      </div>
    );
  }

  return (
    <div className='prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-blockquote:border-r-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:p-4 prose-blockquote:rounded prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2'>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for better RTL support and Persian text
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2 text-right">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mb-3 text-gray-800 border-b border-gray-200 pb-1 text-right">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mb-2 text-gray-800 text-right">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mb-2 text-gray-800 text-right">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-bold mb-1 text-gray-800 text-right">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-bold mb-1 text-gray-800 text-right">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 leading-relaxed text-right">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc list-inside text-gray-700 space-y-1 text-right">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal list-inside text-gray-700 space-y-1 text-right">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 text-right">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg my-4 text-gray-600 italic text-right">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2 text-right text-gray-700">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm my-4 mx-auto block"
            />
          ),
          hr: () => <hr className="my-6 border-gray-300" />,
          // Support for task lists (GitHub Flavored Markdown)
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input 
                  type="checkbox" 
                  checked={checked}
                  className="mr-2"
                  readOnly
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
