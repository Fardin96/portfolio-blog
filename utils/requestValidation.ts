import { NextRequest, NextResponse } from 'next/server';
import {
  GitHookPayload,
  WebhookData,
  WebhookDataResponse,
} from '../public/types/webhookTypes';
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

export function createWebhookData(
  body: GitHookPayload,
  eventType: string
): WebhookData {
  const timestamp = new Date().toISOString();

  return {
    timestamp,
    eventType,
    payload: {
      commits: body.commits,
      head_commit: body.head_commit,
    },
  };
}

export function successResponse() {
  return NextResponse.json({
    success: true,
    message: 'Github webhook received!',
  });
}

export function errorResponse() {
  return NextResponse.json(
    { error: 'Webhook GET error!', webhookData: null },
    { status: 400 }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized!' },
    { status: 401 }
  );
}

export function notFoundResponse() {
  return NextResponse.json(
    {
      error: 'Webhook data not found!',
      webhookData: null,
    },
    { status: 404 }
  );
}
