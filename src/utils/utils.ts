export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export function getAuthorName(name: string): string {
  if (name === 'Fardin96') {
    return 'Farabi Fardin Khan';
  }

  return name;
}
