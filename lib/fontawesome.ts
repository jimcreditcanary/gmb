import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
// CSS is imported above and bundled; stop the library injecting a <style> at runtime (CSP + no FOUC).
config.autoAddCss = false;
