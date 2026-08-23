/**
 * Extracts unique formula and cask names from Brewfile text.
 *
 * @param {string} brewfile Brewfile source.
 * @returns {{casks: string[], formulas: string[]}} Entries in source order.
 */
export default function parseBrewfileEntries(brewfile) {
  const formulas = [];
  const casks = [];

  for (const line of brewfile.split(/\r?\n/)) {
    const formula = line.match(/^\s*brew\s+["']([^"']+)["']/)?.[1];
    const cask = line.match(/^\s*cask\s+["']([^"']+)["']/)?.[1];

    if (formula && !formulas.includes(formula)) formulas.push(formula);
    if (cask && !casks.includes(cask)) casks.push(cask);
  }

  return { casks, formulas };
}
