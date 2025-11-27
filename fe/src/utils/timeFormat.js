import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Formats a timestamp to a human-readable time string
 * Used for message timestamps in chat bubbles
 * Format: "HH:mm" for today, "Hôm qua HH:mm" for yesterday, "T3 25/11 HH:mm" for older dates
 */
export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  
  // Reset time to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  // Same day - show only time
  if (messageDate.getTime() === today.getTime()) {
    return timeStr;
  }
  
  // Yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Hôm qua ${timeStr}`;
  }
  
  // Older dates - show day name and date
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  return `${dayName} ${day}/${month} ${timeStr}`;
}

/**
 * Formats a timestamp to relative or absolute time
 * Used for conversation list last message times
 */
export function formatConversationTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return minutes === 0 ? 'Vừa xong' : `${minutes} phút trước`;
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Hôm qua';
  } else if (diffInHours < 168) { // Less than a week
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } else {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }
}

/**
 * Formats file size to human-readable format
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
