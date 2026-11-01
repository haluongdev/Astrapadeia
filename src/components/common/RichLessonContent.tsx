import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/** Shared safe renderer for approved lesson copy, mathematical questions and explanations.
 * Markdown is rendered as React nodes, not inserted as raw HTML.
 */
export function RichLessonContent({ content }: { content: string }) {
  return (
    <div className="scholyx-rich-content min-w-0 break-words text-slate-200 leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </Markdown>
    </div>
  );
}
