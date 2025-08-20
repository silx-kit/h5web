import { type StoryContext, type StoryFn } from '@storybook/react-vite';

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
