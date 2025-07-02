import {
  Blog,
  BlogPost,
  Project,
  ProjectDetails,
} from '../src/utils/types/types';

export const projectDetails: ProjectDetails = {
  title: `Project`,
  description:
    'This is a detailed description of the project. In a real application, this would be fetched based on the project ID.',
  technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  github: 'https://github.com/yourusername/project',
  liveDemo: 'https://project-demo.example.com',
};

export const projects: Project[] = [
  {
    id: 1,
    title: 'Portfolio Website',
    description:
      'A Next.js based portfolio website showcasing my skills and projects.',
  },
  {
    id: 2,
    title: 'Task Management App',
    description:
      'A React-based application for managing daily tasks and to-dos.',
  },
  {
    id: 3,
    title: 'E-commerce Platform',
    description:
      'A full-stack e-commerce solution with user authentication and product management.',
  },
];

export const blogs: Blog[] = [
  {
    id: 1,
    title: 'Getting Started with Next.js',
    excerpt:
      'Learn how to build a modern web application with Next.js and React.',
    date: '2025-04-10',
  },
  {
    id: 2,
    title: 'The Power of TypeScript',
    excerpt:
      'Why TypeScript is becoming essential for modern JavaScript development.',
    date: '2025-04-01',
  },
  {
    id: 3,
    title: 'Styling in React Applications',
    excerpt: 'Comparing different styling approaches for React applications.',
    date: '2025-03-22',
  },
];

export const blogPost: BlogPost = {
  title: `Blog Post`,
  date: 'April 15, 2025',
  author: 'Farabi',
  content: `
      This is the full content of the blog post. In a real application, this would be 
      fetched based on the blog post ID. You could use Markdown or a rich text editor 
      to create and store your blog content.
      
      ## Heading
      
      This is a paragraph with some **bold text** and *italic text*.
      
      - List item 1
      - List item 2
      - List item 3
      
      ### Code Example
      
      \`\`\`javascript
      function greeting() {
        console.log("Hello, world!");
      }
      \`\`\`
      
      You can expand this with more content as needed.
    `,
};
