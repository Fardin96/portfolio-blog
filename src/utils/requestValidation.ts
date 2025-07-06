import { NextRequest } from 'next/server';
import { GitHookPayload, WebhookData } from './types/webhookTypes';
import { validateGithubSignature } from './authServices';

export async function getRequestBody(
  request: NextRequest
): Promise<string | null> {
  const reqClone: NextRequest = request.clone() as NextRequest;
  const bodyTxt = await reqClone.text();
  return bodyTxt.length > 0 ? bodyTxt : null;
}
export async function parseRequestBody(
  request: NextRequest
): Promise<GitHookPayload | undefined> {
  try {
    return await request.json();
  } catch (jsonError) {
    console.error('Error @ parseRequestBody: ', jsonError);
    return undefined;
  }
}

export function isSignatureValid(
  signature: string | null,
  bodyTxt: string
): boolean {
  if (!signature) {
    return false;
  }

  return validateGithubSignature(bodyTxt, signature);
}

export function isBodyPopulated(body: GitHookPayload): boolean {
  return Object.keys(body).length > 0;
}

export function createWebhookData(body: GitHookPayload): WebhookData {

  const webhookData: WebhookData = {
    id: body.id || '',
    timestamp: body.timestamp || '',
    tree_id: body.tree_id || '',
    message: body.message || '',
    url: body.url || '',
    author: body.author || {
      name: '',
      email: '',
      username: '',
    },
    added: body.added || [] ,
    removed: body.removed || [],
    modified: body.modified || [],
  };

  return webhookData;
}
