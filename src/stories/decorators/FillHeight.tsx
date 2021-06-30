import type { Story } from '@storybook/react';

function FillHeight(MyStory: Story) {
  return (
    <div style={{ display: 'grid', height: '100vh' }}>
      <MyStory />
    </div>
  );
}

export default FillHeight;
