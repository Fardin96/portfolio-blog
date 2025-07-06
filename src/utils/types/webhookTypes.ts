export interface Commit {
  id: string;
  message: string;
  timestamp: string;
  url?: string;
  author?: {
    name: string;
    email: string;
  };
  [key: string]: any;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  url: string;
  [key: string]: any;
}

export interface Sender {
  login: string;
  id: number;
  avatar_url: string;
  [key: string]: any;
}

/*
 * github webhook payload format
 */
// export interface GitHookPayload {
//   commits?: Commit[];
//   repository?: Repository;
//   sender?: Sender;
//   ref?: string;
//   before?: string;
//   after?: string;
//   created?: boolean;
//   deleted?: boolean;
//   forced?: boolean;
//   compare?: string;
//   pusher?: {
//     name: string;
//     email: string;
//   };
//   [key: string]: any; // Allow other properties
// }
export interface GitHookPayload {
  commits?: Commit[];
  head_commit?: Commit;
  [key: string]: any;
}

export interface WebhookData {
  id: string;
  timestamp: string;
  tree_id: string;
  message: string;
  url: string;
  author: {
    name: string;
    email: string;
    username: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

// For API responses
export interface WebhookResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface WebhookDataResponse {
  webhookData: WebhookData | null;
  error?: string;
}
