import { WebhookData } from './webhookTypes';

export type ProjectDetails = {
  title: string;
  description: string;
  technologies: string[];
  github: string;
  liveDemo: string;
};

export type RouteParams = {
  id: string;
};

export type Project = {
  id: number;
  title: string;
  description: string;
};

export type Blog = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
};

export type Tag = {
  title: string;
  value: string;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: Tag[];
  author: {
    name: string;
    image: string;
  };
  mainImage: string;
  body: string;
  gitHubUrl: string;
  demoUrl: string;
};

export type GithubGraphQLRes = {
  repository: {
    object: {
      entries: Array<{
        name: string;
        type: string;
        object: {
          entries: Array<{
            name: string;
            type: string;
            object: {
              text?: string;
            };
          }>;
        };
      }>;
    };
  };
};

export type AllPostsType = 'Project' | 'blog';

export type BlogPost = {
  id?: string;
  title: string;
  date: string;
  author?: string;
  content?: string;
  description?: string;
  path?: string;
  // repository: {
  //   object: {
  //     entries: {
  //       name: string;
  //       type: string;
  //       object: {
  //         entries: {
  //           name: string;
  //           type: string;
  //           object: {
  //             text: string;
  //           };
  //         };
  //       }[];
  //     };
  //   };
  // };
};

// export interface BlogPost {
//   id: string;
//   title: string;
//   description: string;
//   date: string;
//   path: string;
// }

export type AllPosts = {
  id?: string;
  title: string;
  date: string;
  author?: string;
  content?: string;
  description?: string;
  path?: string;
};

// export interface AllPosts {
//   id: string;
//   title: string;
//   description: string;
//   date: string;
// }

type ThemeValue = 'light' | 'dark' | 'system';

export type UseThemeReturnType = {
  theme: string | undefined;
  setTheme: (theme: ThemeValue) => void;
  themes: string[];
  systemTheme?: string;
};

export type SetWebhookDataType = (data: WebhookData | null) => void;
