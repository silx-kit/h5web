function FillHeight<T>(story: () => T) {
  return <div style={{ display: 'grid', height: '100vh' }}>{story()}</div>;
}

export default FillHeight;
