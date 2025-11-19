// This is a wrapper file for exporting the Astro application.
// This is necessary because Astro does not allow us to manually export
// non-Astro stuff as part of the bundle file.
import astroEntry, { pageMap } from "./_worker.js/index.js";
export default astroEntry;
export { pageMap };
