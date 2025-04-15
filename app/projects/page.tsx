'use client';
import Link from 'next/link';

export default function Projects() {
  // Example projects data
  const projects = [
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

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projects.map((project) => (
          <div
            key={project.id}
            className='border rounded-lg p-4 shadow hover:shadow-md'
          >
            <h2 className='text-xl font-semibold mb-2'>{project.title}</h2>
            <p className='text-gray-600 mb-4'>{project.description}</p>
            <Link
              href={`/projects/${project.id}`}
              className='text-blue-500 hover:text-blue-700'
            >
              View Project →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
