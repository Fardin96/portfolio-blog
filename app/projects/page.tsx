'use client';
import Link from 'next/link';
import { projects } from '../../public/static';

export default function Projects(): React.ReactElement {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Projects</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projects.map((project) => (
          <div
            key={project.id}
            className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow hover:scale-105'
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
