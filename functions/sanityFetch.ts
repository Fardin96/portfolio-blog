import { createClient } from '@sanity/client';
import { AllBlogPosts } from '../public/types';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2025-04-26', // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
  // token: process.env.SANITY_SECRET_TOKEN // Needed for certain operations like updating content, accessing drafts or using draft perspectives
});

export async function getAllProjects(): Promise<AllBlogPosts[]> {
  try {
    const query = `*[_type == "Project"]{
      title,
      "description": description[0].children[0].text
    }`;

    const posts = await client.fetch<AllBlogPosts[]>(query);
    // console.log('+-------------------getpost-----------------+');
    // console.log(posts);

    // return JSON.stringify(posts, null, 2); // Convert to string for display
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    // return `Error fetching posts: ${error.message}`;
  }
}

// export async function createPost(post: Post) {
//   const result = client.create(post)
//   return result
// }

// export async function updateDocumentTitle(_id, title) {
//   const result = client.patch(_id).set({title})
//   return result
// }
