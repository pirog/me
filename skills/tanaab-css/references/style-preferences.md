# Style Preferences

- Prefer SCSS over raw CSS, Less, or Stylus for stylesheet authoring.
- Use plain `.css` only when the task explicitly requires raw CSS or the surrounding toolchain does not support SCSS.
- Do not choose Less or Stylus by default.
- In Vue single-file components, prefer `<style lang="scss">` when component-scoped styling is needed.
- Keep SCSS structure readable: shared variables, mixins, and partials should clarify the design system rather than hide it.
