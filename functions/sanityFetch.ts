import { createClient } from '@sanity/client';
import { AllPosts, AllPostsType, Post } from '../public/types/types';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2025-04-26', // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
});

export async function getAllPosts(docName: AllPostsType): Promise<AllPosts[]> {
  try {
    const query = `*[_type == $docName]{
      "id": _id,
      title,
      "description": description[0].children[0].text,
      "date": publishedAt
    }`;

    const posts = await client.fetch<AllPosts[]>(query, {
      docName,
    });
    // console.log('+-------------------getAllPosts-----------------+');
    // console.log(JSON.stringify(posts, null, 2));  // Convert to string for display

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);

    throw error instanceof Error
      ? error
      : new Error('Unknown error occured while fetching posts!');
  }
}

export async function getSinglePost(
  docName: AllPostsType,
  postId: string
): Promise<Post> {
  try {
    const query = `*[_type == $docName && _id == $postId][0]{
      "id": _id,
      title,
      "tags": tags[]->{ title, value },
      "description": description[0].children[0].text,
      "date": publishedAt,
      author->{name, "image": image.asset->url},
      "mainImage": mainImage.asset->url,
      body
    }`;

    const post = await client.fetch<Post>(query, {
      docName,
      postId,
    });

    if (!post) {
      throw new Error(`Post with ID "${postId}" not found`);
    }

    // console.log('+------------------------SINGLE-POST----------------------+');
    // console.log(JSON.stringify(post, null, 2));

    return post;
  } catch (error) {
    console.error('Error fetching single post:', error);

    throw error instanceof Error
      ? error
      : new Error('Unknown error occurred while fetching the post!');
  }
}
