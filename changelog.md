# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-20

Initial release.

### Added

- **Appearance → NavSweeper** admin page: pick a menu and see every item
  with its label, URL and type in a familiar list table, with a select-all
  checkbox.
- Bulk delete: remove any number of selected items after a confirmation.
- Bulk move: move selected items to another menu (or reset them to top level
  within the current one); the current menu is marked in the destination
  list.
- Bulk edit modal: update label, URL, CSS classes, link target and
  description on every selected item; only the fields you tick are changed.
- Add item: a `+` button on each row opens an "Add Above / Add Below" menu
  that positions a new custom link exactly where you want it, with optional
  CSS classes, link target and description.
- Block theme compatibility: registers a default menu location when the
  active theme has none, so the Menus screen and NavSweeper are available
  under block themes such as Twenty Twenty-Five.
- Accessibility: every checkbox and field has an accessible name; modals are
  labelled `role="dialog"` elements that trap Tab, close on Escape and return
  focus to their trigger; the add-item menu uses `aria-haspopup` /
  `aria-expanded` with arrow-key navigation; all output is escaped; zero axe
  violations in every page and modal state.
- i18n: `languages/navsweeper.pot`; Greek translation (`.po` and `.mo`).
- Tooling: wp-env with a menu seed script, PHPCS (WPCS) on PHP 8.1 and 8.3,
  Playwright + axe-core suite that seeds its own menus through the REST API,
  `bun run bundle` → installable zip, GitHub Actions CI and tag-driven
  release workflows.

[1.0.0]: https://github.com/mgiannopoulos24/NavSweeper/releases/tag/v1.0.0
