const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string;
const region = 'us-central1';

export function functionsUrl(name: string): string {
  return `https://${region}-${projectId}.cloudfunctions.net/${name}`;
}
