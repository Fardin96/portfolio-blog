import { revalidateTag } from 'next/cache';

/**
 ** HANDLE CACHE REVALIDATION FOR WEBHOOK COMMITS
 * @param body - The webhook request body containing commit data
 * @returns void
 */
export function handleCacheRevalidation(body: any): void {
  // get modified file paths
  const modifiedFiles: string[] = [
    ...body?.head_commit?.removed,
    ...body?.head_commit?.modified,
  ];

  // remove cache for specific posts only
  modifiedFiles.forEach((file) => {
    revalidateTag(`github-blog-post-${file}`);
  });

  // invalidate blog list if new posts are added/removed/modified
  if (
    body?.head_commit?.added?.length > 0 ||
    body?.head_commit?.removed?.length > 0 ||
    body?.head_commit?.modified?.length > 0
  ) {
    revalidateTag('github-blogs');
  }
}
