import { type StoryFn } from '@storybook/react-vite';

function CenterTop(Story: StoryFn) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '1.5rem',
      }}
    >
      <Story />
    </div>
  );
}

export default CenterTop;
