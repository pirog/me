/** Remove simulation disclaimers and cancelled restow actions, preserving real drift. */
export default function stripStowSimulationNoise(output) {
  const lines = [];
  const unlinks = new Map();
  for (const line of output.split(/\r?\n/)) {
    if (line.trim() === 'WARNING: in simulation mode so not modifying filesystem.') continue;
    const reverted = line.match(/^LINK: (.+?) => .+ \(reverts previous action\)$/);
    if (reverted && unlinks.has(reverted[1])) {
      lines[unlinks.get(reverted[1])] = '';
      unlinks.delete(reverted[1]);
      continue;
    }
    const unlink = line.match(/^UNLINK: (.+)$/);
    if (unlink) unlinks.set(unlink[1], lines.length);
    lines.push(line);
  }
  return lines.filter(Boolean).join('\n').trim();
}
