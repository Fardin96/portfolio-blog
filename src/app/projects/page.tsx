import { Suspense } from 'react';
import { getAllPosts } from '../../utils/sanityServices';
import { AllPosts } from '../../utils/types/types';
import { ProjectsWithFilters } from '../../components/ProjectsWithFilters';

function ProjectsLoadingFallback() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>My Projects</h1>
      <h3>loading...</h3>
    </div>
  );
}

export default async function Projects() {
  const data: AllPosts[] = await getAllPosts('Project');

  // Extract unique tags
  const allTags = data
    .map((project) => project.tags?.map((tag) => tag.title) || [])
    .flat()
    .filter(Boolean);
  const uniqueTags = Array.from(new Set(allTags)).sort();

  // Error/empty handled in component
  return (
    <Suspense fallback={<ProjectsLoadingFallback />}>
      <ProjectsWithFilters allProjects={data} tags={uniqueTags} />
    </Suspense>
  );
}
