import type { StoryContext, StoryFn } from '@storybook/react';

function FillHeight(Story: StoryFn, context: StoryContext) {
  const { viewMode } = context;

  return (
    <div
      style={{
        display: 'grid',
        height: viewMode === 'story' ? '100vh' : '25rem', // fixed height in docs mode
      }}
    >
      <Story />
    </div>
  );
}

export default FillHeight;
