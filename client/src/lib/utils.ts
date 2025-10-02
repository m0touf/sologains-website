// Utility functions

// Date utilities
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTimeRemaining = (completedAt: string) => {
  const now = new Date();
  const completionTime = new Date(completedAt);
  const timeLeft = completionTime.getTime() - now.getTime();
  
  if (timeLeft <= 0) return { hours: 0, minutes: 0, percentage: 100 };
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, timeLeft };
};

// Number utilities
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Game utilities
export const calculateXpProgress = (currentXp: number, level: number) => {
  const LMAX = 100;
  let cumulativeXp = 0;
  
  for (let i = 1; i < level; i++) {
    cumulativeXp += Math.floor(100 * Math.pow(1.15, i - 1));
  }
  
  const xpInLevel = currentXp - cumulativeXp;
  const xpNeeded = Math.floor(100 * Math.pow(1.15, level - 1));
  const percentage = Math.min(100, (xpInLevel / xpNeeded) * 100);
  
  return {
    current: xpInLevel,
    needed: xpNeeded,
    percentage
  };
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-800';
    case 'medium': return 'text-yellow-800';
    case 'hard': return 'text-orange-800';
    case 'legendary': return 'text-red-800';
    default: return 'text-gray-800';
  }
};

export const getDifficultyBg = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-200';
    case 'medium': return 'bg-yellow-200';
    case 'hard': return 'bg-orange-200';
    case 'legendary': return 'bg-red-200';
    default: return 'bg-gray-200';
  }
};

export const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'EASY';
    case 'medium': return 'MED';
    case 'hard': return 'HARD';
    case 'legendary': return 'LEG';
    default: return '???';
  }
};
