/** Remove GNU Stow's simulation disclaimer from otherwise meaningful output. */
export default function stripStowSimulationNoise(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => line.trim() !== 'WARNING: in simulation mode so not modifying filesystem.')
    .join('\n')
    .trim();
}
