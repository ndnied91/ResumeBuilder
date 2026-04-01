export const getScoreStyles = (score) => {
  if (score >= 80) {
    return {
      badge: 'bg-green-100 text-green-700 border-green-200',
      ring: 'stroke-green-500',
      text: 'Strong match',
    };
  }

  if (score >= 60) {
    return {
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      ring: 'stroke-yellow-500',
      text: 'Decent match',
    };
  }

  return {
    badge: 'bg-red-100 text-red-700 border-red-200',
    ring: 'stroke-red-500',
    text: 'Needs improvement',
  };
};
