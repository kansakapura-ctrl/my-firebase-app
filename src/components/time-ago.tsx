'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

type TimeAgoProps = {
  date: Date | { toDate: () => Date };
};

export function TimeAgo({ date: dateProp }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // This code will only run on the client
    const date = dateProp && 'toDate' in dateProp ? dateProp.toDate() : dateProp;

    if (date instanceof Date && !isNaN(date.getTime())) {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    } else {
      setTimeAgo('just now');
    }
  }, [dateProp]);

  // Render a placeholder on the server, and the real value on the client
  // This prevents a hydration mismatch.
  if (!timeAgo) {
    return null; // Or a skeleton loader
  }

  return <>{timeAgo}</>;
}
