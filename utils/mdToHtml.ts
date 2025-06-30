import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { VFile } from 'vfile';
import { createElement, Fragment } from 'react';
import rehypeReact from 'rehype-react';

export async function mdToHtml(mdContent: string): Promise<VFile> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    // .use(rehypeReact, {
    //   createElement,
    //   Fragment,
    //   // You can customize component mapping here
    //   components: {
    //     // h1: (props) => <h1 className='custom-h1' {...props} />,
    //     // code: (props) => <code className='custom-code' {...props} />,
    //   },
    // })
    .process(mdContent);

  return result.toString();
}
