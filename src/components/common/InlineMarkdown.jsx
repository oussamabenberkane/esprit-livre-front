import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const InlineMarkdown = ({ children }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={['strong', 'em', 'del', 'code', 'a']}
        unwrapDisallowed
        components={{
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => <del>{children}</del>,
            code: ({ children }) => (
                <code className="font-mono bg-black/10 px-0.5 rounded text-[0.85em]">{children}</code>
            ),
            a: ({ href, children }) => (
                <a href={href} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ),
        }}
    >
        {children || ''}
    </ReactMarkdown>
);

export default InlineMarkdown;
