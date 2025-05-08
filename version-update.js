import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { readFile, writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * get the current Version of a File
 * @param {*} file File to read
 * @returns {[number, number , number] as const}
 */
async function getCurrentVersion(file) {
  const rawData = await readFile(file);
  const data = JSON.parse(rawData);
  const versionRaw = data.version;
  const [_version, major, minor, patch] = versionRaw.match(
    /([0-9]+).([0-9]+).([0-9]+)/
  );
  return [Number(major), Number(minor), Number(patch)];
}

/**
 * Updates the Version in all Files
 * @param {string[]} files Files to update
 */
async function versionUpdate(files) {
  const [major, minor, patch] = await getCurrentVersion(files[0]);
  console.log({ major, minor, patch });
  for (const file of files) {
    const rawData = await readFile(file);
    const data = JSON.parse(rawData);
    data.version = `${major}.${minor}.${patch + 1}`;
    const writeData = JSON.stringify(data, undefined, 2);
    await writeFile(file, writeData);
  }
}

console.log("Start Version Update");
versionUpdate([
  resolve(__dirname, "package.json"),
  resolve(__dirname, "public", "manifest.json"),
  resolve(__dirname, "public", "manifest.dev.json"),
]).then(() => console.log("Finish Version Update"));
