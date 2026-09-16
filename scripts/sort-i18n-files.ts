import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';

import {
  Presets,
  SingleBar,
} from 'cli-progress';
import { Command } from 'commander';

import { projectRoot } from '../webpack/helpers';

const program = new Command();
program.version('1.0.0', '-v, --version');

const LANGUAGE_FILES_LOCATION = 'src/assets/i18n';

interface Entry {
  key: string;
  lines: string[];
}

parseCliInput();

/**
 * Purpose: Sorts the keys of one or more i18n *.json5 files alphabetically (case-insensitive),
 * while keeping every key's preceding comment lines (e.g. the commented-out source reference and
 * any "// TODO ..." lines) grouped and moved together with their corresponding key.
 *
 * This does NOT change any key or value: it only reorders entries and removes exact duplicate keys
 * (keeping the last occurrence, matching standard JSON semantics).
 *
 * Example execution:
 * ```
 *   npm run sort-i18n
 *   npm run sort-i18n -- -f src/assets/i18n/it.json5
 *   npm run sort-i18n -- -f src/assets/i18n/it.json5 -f src/assets/i18n/en.json5
 * ```
 *
 * Input parameters:
 * * Files: One or more specific files to sort
 *   - Optional, repeatable
 *   - If omitted, every *.json5 file inside the language files directory is sorted
 * * Dir: The directory to look up files in when no explicit files are given
 *   - Defaults to src/assets/i18n
 */
function parseCliInput() {
  program
    .option('-f, --file <file>', 'path to a specific file to sort; repeatable', collectFiles, [])
    .option('-d, --dir <dir>', 'directory containing the *.json5 files to sort when no -f is given', LANGUAGE_FILES_LOCATION)
    .usage('([-f <file>]... | [-d <dir>])')
    .parse(process.argv);

  const explicitFiles: string[] = program.opts().file;

  const filesToSort: string[] = explicitFiles.length > 0
    ? explicitFiles
    : readdirSync(projectRoot(program.opts().dir))
      .filter(file => file.endsWith('.json5'))
      .map(file => projectRoot(program.opts().dir) + '/' + file);

  const missingFiles = filesToSort.filter(file => !existsSync(file));
  if (missingFiles.length > 0) {
    console.error('The following file(s) could not be found: ' + missingFiles.join(', '));
    console.info(program.outputHelp());
    process.exit(1);
  }

  const progressBar = new SingleBar({}, Presets.shades_classic);
  progressBar.start(filesToSort.length, 0);

  filesToSort.forEach(file => {
    sortFile(file);
    progressBar.increment();
  });

  progressBar.stop();
}

function collectFiles(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

/**
 * Reads the given i18n file, groups its content into entries (a key together with any comment
 * lines directly preceding it), sorts those entries alphabetically by key (case-insensitive),
 * drops duplicate keys (keeping the last occurrence) and writes the result back to the same file.
 * @param pathToFile Valid path to the *.json5 file to sort in-place
 */
function sortFile(pathToFile: string): void {
  const fileContent = readFileSync(pathToFile, 'utf8');
  const lines = fileContent.replace(/\n$/, '').split('\n');

  if (lines[0].trim() !== '{' || lines[lines.length - 1].trim() !== '}') {
    console.error(`Skipping ${pathToFile}: expected the file to start with "{" and end with "}"`);
    return;
  }

  const body = lines.slice(1, lines.length - 1);
  const entries = parseEntries(body, pathToFile);

  if (entries === null) {
    return;
  }

  const dedupedEntries = dedupeKeepLast(entries);
  const sortedEntries = [...dedupedEntries].sort((a, b) => compareKeysCaseInsensitive(a.key, b.key));

  writeFileSync(pathToFile, renderEntries(sortedEntries), { encoding: 'utf8' });
}

/**
 * Parses the body of an i18n file (everything between the outer braces) into a list of entries.
 * Each entry consists of the zero or more leading "//" comment lines belonging to a key, plus the
 * key-value line itself. Blank separator lines between entries are discarded (they get re-added
 * when rendering the output).
 * @param body        The lines of the file, excluding the first "{" and last "}" line
 * @param pathToFile  Path of the file being parsed, used for error reporting only
 * @return            The parsed entries, or null if the file does not match the expected structure
 */
function parseEntries(body: string[], pathToFile: string): Entry[] | null {
  const keyLineRegex = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*("(?:[^"\\]|\\.)*"|null)\s*,?\s*$/;
  const entries: Entry[] = [];

  let i = 0;
  while (i < body.length) {
    const line = body[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const entryLines: string[] = [];
    while (i < body.length && body[i].trim().startsWith('//')) {
      entryLines.push(body[i]);
      i++;
    }

    if (i >= body.length) {
      console.error(`Skipping ${pathToFile}: file ended after comment(s) without a following key-value line`);
      return null;
    }

    const keyLine = body[i];
    const match = keyLine.match(keyLineRegex);
    if (!match) {
      console.error(`Skipping ${pathToFile}: expected a key-value line, got: ${keyLine}`);
      return null;
    }

    entryLines.push(keyLine);
    entries.push({ key: match[1], lines: entryLines });
    i++;

    while (i < body.length && body[i].trim() === '') {
      i++;
    }
  }

  return entries;
}

/**
 * Compares two keys the same way the "jsonc/sort-keys" ESLint rule does with caseSensitive: false,
 * i.e. by lower-casing both keys and comparing them by character (Unicode code point) rather than
 * using a locale-aware comparison, which can disagree on characters like "-", "_" and ".".
 * @param keyA First key to compare
 * @param keyB Second key to compare
 * @return     A negative number, zero or a positive number, as expected by Array#sort
 */
function compareKeysCaseInsensitive(keyA: string, keyB: string): number {
  const lowerA = keyA.toLowerCase();
  const lowerB = keyB.toLowerCase();
  if (lowerA < lowerB) {
    return -1;
  }
  if (lowerA > lowerB) {
    return 1;
  }
  return 0;
}

/**
 * Removes duplicate keys, keeping only the last occurrence of each key (this matches the semantics
 * of parsing a JSON object where later keys overwrite earlier ones with the same name).
 * @param entries All parsed entries, potentially containing duplicate keys
 * @return        The entries with duplicates removed, in their original relative order
 */
function dedupeKeepLast(entries: Entry[]): Entry[] {
  const lastIndexForKey = new Map<string, number>();
  entries.forEach((entry, index) => lastIndexForKey.set(entry.key, index));

  const keepIndices = new Set(lastIndexForKey.values());
  return entries.filter((_, index) => keepIndices.has(index));
}

/**
 * Renders the sorted entries back into the file format used by the i18n *.json5 files: an opening
 * brace, each entry's comment lines followed by its key-value line (always ending in a trailing
 * comma), separated by blank lines, and a closing brace.
 * @param entries The sorted (and deduplicated) entries to render
 * @return        The full file content as a string
 */
function renderEntries(entries: Entry[]): string {
  const outputLines: string[] = ['{'];

  entries.forEach((entry, index) => {
    entry.lines.forEach((line, lineIndex) => {
      const isKeyLine = lineIndex === entry.lines.length - 1;
      let renderedLine = line.replace(/\s+$/, '');
      if (isKeyLine && !renderedLine.endsWith(',')) {
        renderedLine += ',';
      }
      outputLines.push(renderedLine);
    });
    if (index !== entries.length - 1) {
      outputLines.push('');
    }
  });

  outputLines.push('}');
  return outputLines.join('\n') + '\n';
}
