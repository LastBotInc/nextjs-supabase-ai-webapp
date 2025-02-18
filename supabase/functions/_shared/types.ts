export interface Config {
  runtime: 'deno' | 'edge';
  regions?: string[];
  path?: string;
  memory?: number;
  maxDuration?: number;
} 