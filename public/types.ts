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

export type AllPosts = {
  id: string;
  title: string;
  description: string;
  date: string | null;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  author: {
    name: string;
    image: string;
  };
  mainImage: string;
  body: string;
  gitHubUrl: string;
  demoUrl: string;
};

export type AllPostsType = 'Project' | 'blog';

export type BlogPost = {
  title: string;
  date: string;
  author: string;
  content: string;
};

type ThemeValue = 'light' | 'dark' | 'system';

export type UseThemeReturnType = {
  theme: string | undefined;
  setTheme: (theme: ThemeValue) => void;
  themes: string[];
  systemTheme?: string;
};
