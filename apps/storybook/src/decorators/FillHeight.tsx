import type { StoryContext, StoryFn } from '@storybook/react';

function FillHeight(Story: StoryFn, context: StoryContext) {
  return (
    <div
      style={{
        display: 'grid',
        height: context.viewMode === 'story' ? '100vh' : '25rem', // fixed height in docs mode
      }}
    >
      <Story />
    </div>
  );
}

export default FillHeight;
