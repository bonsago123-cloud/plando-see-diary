import 'server-only';
import {neon} from '@neondatabase/serverless';
export function db() {
  const url=process.env.DATABASE_URL;
  if(!url || !url.startsWith('postgresql://') && !url.startsWith('postgres://')) throw new Error('DATABASE_NOT_CONFIGURED');
  return neon(url);
}
