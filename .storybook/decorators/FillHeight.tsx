import React from 'react';
import type { Story } from '@storybook/react';

function FillHeight(VisCanvasStory: Story) {
  return (
    <div style={{ display: 'grid', height: '100vh' }}>
      <VisCanvasStory />
    </div>
  );
}

export default FillHeight;
