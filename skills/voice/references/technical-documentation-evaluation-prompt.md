# Evaluation Task: `stacker sweep`

Write a compact Markdown documentation page for a fictional command named `stacker sweep`.

Audience: developers who already use Stacker but have not used this command.

Preserve these facts exactly:

- `stacker sweep` removes stopped development containers owned by the current project.
- It affects only the current project by default.
- `--all-projects` expands the operation to stopped Stacker containers from every project.
- `--dry-run` prints the containers that would be removed and takes no action.
- The command never removes running containers or named volumes.
- Removed containers are recreated the next time their project starts.

Formatting requirements:

- 250 to 400 words.
- Exactly one H1 heading and no more than three H2 headings.
- One warning callout.
- At least two fenced shell examples.
- No table of contents, FAQ, recap, or conclusion section.

Return only the finished Markdown page.
