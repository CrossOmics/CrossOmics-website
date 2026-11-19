# Tool version lineage

Approved direction: the user accepted the interactive STAR/NuSTAR prototype and requested production integration, zoom for large lineages, and replacement of the upper-right “Parent → derived version” text.

## Intent and scope
Show the true ancestry of all published versions within one Tool. Keep the existing version list and complete version details, attribution, recommendations, withdrawn states, and admin actions. The graph is presentation only; no backend or SQL migration.

## Approach
Use a small React client view with HTML node buttons and SVG connectors, derived from existing version IDs and parent IDs. Keep the server-rendered detail cards as slots so graph selection and list view share exactly the same content. A graph library would add a dependency for interactions that need only translation and scale; a static SVG alone would not provide accessible node controls.

## Behavior
Versions gets a View lineage / View version list toggle, initially the list. Selecting a node shows that version's full existing card. Parents precede children regardless of API order or recommendation order; recommendations and withdrawn versions remain explicit badges. Include all branches and multiple roots. Missing parents and invalid cyclic links remain visible as unlinked nodes with a warning, never guessed ancestry.

Graph controls: zoom out/in (10%–200%), current percentage, Reset (100%), Fit to view, mouse/touch drag and two-finger pinch. Native page scrolling remains available outside the canvas. Keyboard buttons provide equivalent zoom and fitting; focusing a node brings it into the canvas viewport. Controls remain available with many nodes. Do not intercept browser Ctrl/Cmd+wheel zoom.

Replace the upper-right caption with “Select a version to view details”. Match existing Community tokens; support narrow screens and reduced motion. No example/fabricated versions in production.

## Validation
Test branched/out-of-order ancestry, malformed links/cycles, long chains without recursion overflow, fit/zoom bounds and anchor preservation. Test integration with real Next rendering and manually exercise hydrated list/graph selection, controls, pan/pinch, and narrow layout. Backend identity and authorization remain unchanged.
