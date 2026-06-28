# Localized JS Variables

Each JS file is enqueued from exactly one place with a known localized object.

## Rules

1. **Never typeof-check the localized object.** It is always defined when the script runs. Use it directly:
   ```js
   // BAD
   var jsVars = (typeof my_plugin_js_vars !== 'undefined') ? my_plugin_js_vars : {};

   // GOOD
   var jsVars = my_plugin_js_vars;
   ```

2. **Never add inline fallback strings for i18n properties.** All translatable strings are provided by `wp_localize_script` in PHP. If a string is needed, add it in the PHP enqueue — not as a JS fallback:
   ```js
   // BAD
   $title.text(jsVars.i18n_some_label || 'Some Label');

   // GOOD
   $title.text(jsVars.i18n_some_label);
   ```

3. **Never cross-reference another file's localized object** (e.g. checking for `plugin_admin_vars` inside a frontend script). Each file uses its own.
