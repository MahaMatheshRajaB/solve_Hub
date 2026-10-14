export function formatCount(n) {
  if (n === null || n === undefined) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'now';
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffMinutes = Math.floor((Date.now() - time) / 60000);
  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function getAvatarColor(name = '?') {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0) * 9, 0);
  return `hsl(${hash % 360}, 70%, 75%)`;
}
