# Front-End Preferences

- Prefer Vue 3 for front-end components.
- Prefer VitePress 1 for static websites.
- Prefer SCSS for Vue component and VitePress theme styling.
- Use plain `.css` only when the task explicitly requires raw CSS or the surrounding toolchain does not support SCSS.
- Do not choose Less or Stylus by default.
- For Tanaab-styled static sites, prefer subthemes built on [tanaabased/theme](https://github.com/tanaabased/theme).
- For non-Tanaab styled static sites, prefer subthemes built on [lando/vitepress-theme-default-plus](https://github.com/lando/vitepress-theme-default-plus).
- Use the published theme documentation for `vitepress-theme-default-plus` at [vitepress-theme-default-plus.lando.dev](https://vitepress-theme-default-plus.lando.dev/).
- Keep local branding, layout, and presentation changes in a project subtheme layer instead of forking the upstream theme when a subtheme is sufficient.
- Keep SCSS structure readable: shared variables, mixins, and partials should clarify the design system rather than hide it.
