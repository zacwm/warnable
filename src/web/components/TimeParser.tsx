import * as React from 'react';

import { Tooltip, Text } from '@mantine/core';

export default function TimeParser({ unix }: { unix: number }) {
  const [timeReadable, setTimeReadable] = React.useState('');
  const [XtimeAgo, setXtimeAgo] = React.useState('');

  React.useEffect(() => {
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    // Parse unix to timeReadable (Monday, 1 January 2021 00:00:00)
    const date = new Date(unix * 1000);
    const day = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hours = zeroPad(date.getHours(), 2);
    const minutes = zeroPad(date.getMinutes(), 2);
    const seconds = zeroPad(date.getSeconds(), 2);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    setTimeReadable(`${days[day]}, ${date.getDate()} ${months[month]} ${year} ${hours}:${minutes}:${seconds}`);

    // X time ago parser (if less than 1 week)
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 604800000) {
      // If less than 1 minute ago, set to 'Just now'
      if (diff < 60000) {
        setXtimeAgo('Just now');
        return;
      }
      // If less than 1 hour ago, set to 'X minutes ago'
      if (diff < 3600000) {
        setXtimeAgo(`${Math.floor(diff / 60000)} minutes ago`);
        return;
      }
      // If less than 1 day ago, set to 'X hours ago'
      if (diff < 86400000) {
        setXtimeAgo(`${Math.floor(diff / 3600000)} hours ago`);
        return;
      }
      // If less than 1 week ago, set to 'X days ago'
      if (diff < 604800000) {
        setXtimeAgo(`${Math.floor(diff / 86400000)} days ago`);
        return;
      }
    }
  }, [unix]);

  if (!timeReadable) return null;

  if (!XtimeAgo) {
    return (
      <Text>{timeReadable}</Text>
    );
  }

  return (
    <Tooltip
      label={timeReadable}
      withArrow
      position="bottom"
      color="gray"
    >
      <Text sx={{ width: 'fit-content' }}>{XtimeAgo}</Text>
    </Tooltip>
  );
}