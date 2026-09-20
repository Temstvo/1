// Generates display-only metadata. Credentials and full JSON stay in serv-configs.
const { resolve, join } = require('node:path');
const { mkdir, writeFile } = require('node:fs/promises');
const { loadImportedProfiles } = require('../apps/backend/dist/modules/vpn/imported-profiles');
async function main() {
  const root = resolve(__dirname, '..');
  const result = await loadImportedProfiles(resolve(process.argv[2] || join(root, 'serv-configs')));
  if (!result.profiles.size)
    throw new Error('No valid server profiles found; existing catalog was not changed');
  if (result.rejected.length)
    throw new Error(
      `${result.rejected.length} files rejected; fix local profiles before publishing metadata`,
    );
  const profiles = [...result.profiles.values()]
    .map((p) => p.summary)
    .sort(
      (a, b) =>
        a.country.localeCompare(b.country, 'ru') ||
        a.name.localeCompare(b.name, 'ru', { numeric: true }),
    );
  const target = join(root, 'apps/frontend/src/data');
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'imported-servers.json'), JSON.stringify(profiles, null, 2) + '\n');
  console.log(
    JSON.stringify({
      files: result.files,
      profiles: profiles.length,
      duplicates: result.duplicates,
      countries: new Set(profiles.map((p) => p.countryCode).filter(Boolean)).size,
      credentialsPublished: false,
    }),
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
