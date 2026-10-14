import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function extractHashtags(text) {
  const regex = /#(\w+)/g;
  const tags = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)];
}

export function highlightHashtags(text) {
  return text.replace(/#(\w+)/g, '<span class="text-violet-400 font-medium">#$1</span>');
}

export function sharePost(postId) {
  const url = `${window.location.origin}/post/${postId}`;
  navigator.clipboard.writeText(url).then(() => {
    return true;
  });
  return url;
}

export const CATEGORIES = [
  'Technology', 'Programming', 'Science', 'Health', 'Finance',
  'Career', 'Relationships', 'Education', 'Productivity', 'Other'
];
