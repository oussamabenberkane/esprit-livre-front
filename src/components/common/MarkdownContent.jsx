import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders markdown with book-appropriate prose styling.
 * Pass compact=true in truncated/preview contexts to suppress paragraph margins.
 */
const MarkdownContent = ({ children, className = '', compact = false }) => {
    const pClass = compact
        ? 'leading-relaxed'
        : 'mb-2 last:mb-0 leading-relaxed';

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-[#1c2d55] mb-2 mt-3 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold text-[#1c2d55] mb-1.5 mt-3 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-[#1c2d55] mb-1 mt-2 first:mt-0">{children}</h3>
                    ),
                    p: ({ children }) => <p className={pClass}>{children}</p>,
                    strong: ({ children }) => (
                        <strong className="font-semibold text-[#1c2d55]">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    del: ({ children }) => <del className="text-gray-400">{children}</del>,
                    ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-[3px] border-[#00417a]/35 pl-3 italic text-gray-500 my-2">
                            {children}
                        </blockquote>
                    ),
                    pre: ({ children }) => (
                        <pre className="bg-gray-50 border border-gray-200 p-3 rounded-lg overflow-x-auto my-2 text-sm">
                            {children}
                        </pre>
                    ),
                    code: ({ children, className: cls }) => {
                        if (cls?.includes('language-')) {
                            return (
                                <code className={`font-mono text-gray-700 text-sm ${cls}`}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="font-mono bg-blue-50 text-[#00417a] px-1.5 py-0.5 rounded text-[0.85em] border border-blue-100/80">
                                {children}
                            </code>
                        );
                    },
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-[#00417a] underline underline-offset-2 hover:text-blue-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="border-gray-200 my-3" />,
                }}
            >
                {children || ''}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
