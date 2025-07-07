import { revalidateTag } from 'next/cache';
import { createWebhookData } from '../utils/requestValidation';
import { getRedisData, setRedisData } from '../utils/redisServices';
import { WebhookData } from '../utils/types/webhookTypes';
import { NextResponse } from 'next/server';
import { unauthorizedResponse } from './Response';

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
    // Also invalidate commit cache
    revalidateTag('github-commit');
  }
}

/**
 ** STORE WEBHOOK DATA IN REDIS
 * @param body - The webhook request body containing commit data
 * @returns void
 */
export async function storeWebhookData(body: any) {
  // format
  const webhookData = createWebhookData(body.head_commit);

  // group with existing data
  const existing = (await getRedisData('webhookData')) as string;
  const existingData: WebhookData[] = existing ? JSON.parse(existing) : [];
  existingData.unshift(webhookData);

  // limit to 10 commits & store
  const noOfCommits = 10;
  await setRedisData(
    'webhookData',
    JSON.stringify(existingData.slice(0, noOfCommits))
  );
}
