import { defineWorkspace } from 'vitest/config';

const projects = defineWorkspace(['packages/*']);
export default projects;
