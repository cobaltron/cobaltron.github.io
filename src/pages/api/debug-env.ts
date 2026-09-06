/**
 * TEMPORARY diagnostic. Delete once Keystatic auth is working.
 *
 * Reports only whether variables are PRESENT, never their values, plus which
 * commit is actually deployed. Exists to distinguish two failure modes that
 * look identical from outside:
 *
 *   - the variables aren't in the deployed environment at all
 *   - they are, but astro:env's getSecret() isn't reading them
 */
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

export const prerender = false;

const SECRETS = [
  'KEYSTATIC_GITHUB_CLIENT_ID',
  'KEYSTATIC_GITHUB_CLIENT_SECRET',
  'KEYSTATIC_SECRET',
];

export const GET: APIRoute = () => {
  const viaProcessEnv: Record<string, boolean> = {};
  const viaGetSecret: Record<string, boolean | string> = {};

  for (const name of SECRETS) {
    viaProcessEnv[name] = Boolean(process.env[name]);
    try {
      viaGetSecret[name] = Boolean(getSecret(name));
    } catch (error) {
      viaGetSecret[name] = `threw: ${(error as Error).message.slice(0, 120)}`;
    }
  }

  const report = {
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    builtAt: import.meta.env.BUILD_STAMP ?? null,
    viaProcessEnv,
    viaGetSecret,
    publicSlugInlinedAtBuild: Boolean(import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG),
    publicSlugAtRuntime: Boolean(process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG),
  };

  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
