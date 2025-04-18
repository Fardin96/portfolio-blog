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

export type BlogPost = {
  title: string;
  date: string;
  author: string;
  content: string;
};

export type ThemeType = 'light' | 'dark' | 'system';
