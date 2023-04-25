import type { StoryFn } from '@storybook/react';

function Center(Story: StoryFn) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Story />
    </div>
  );
}

export default Center;
