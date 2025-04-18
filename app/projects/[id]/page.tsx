'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { RouteParams } from '../../../public/types';
import { projectDetails } from '../../../public/static';

export default function ProjectDetail(): React.ReactElement {
  const params = useParams<RouteParams>();
  const id = params.id;

  return (
    <div>
      <Link
        href='/projects'
        className='text-blue-500 hover:text-blue-700 mb-4 inline-block'
      >
        ← Back to projects
      </Link>

      <h1 className='text-3xl font-bold mb-4'>{projectDetails.title}</h1>

      <div className='p-6 rounded-lg mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Description</h2>
        <p>{projectDetails.description}</p>
      </div>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Technologies Used</h2>

        <div className='flex flex-wrap gap-2'>
          {projectDetails.technologies.map((tech, index) => (
            <span
              key={index}
              className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className='flex gap-4'>
        <a
          href={projectDetails.github}
          className='bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700'
        >
          GitHub Repository
        </a>

        <a
          href={projectDetails.liveDemo}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Live Demo
        </a>
      </div>
    </div>
  );
}
