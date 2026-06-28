# i18n Function Selection

Use `__()` and `_e()` for string literals. Only use `esc_html__()` / `esc_html_e()` when the input contains a variable or dynamic content.

```php
// BAD - string literal doesn't need escaping
esc_html__( 'Some translatable string', 'plugin-name' )
esc_html_e( 'Another string', 'plugin-name' )

// GOOD - string literal, use __() or _e()
__( 'Some translatable string', 'plugin-name' )
_e( 'Another string', 'plugin-name' )

// GOOD - dynamic content, escaping is appropriate
esc_html( sprintf( __( 'Written by %s', 'plugin-name' ), $author_name ) )
```

Escape at the **output boundary** (`esc_html()`, `esc_attr()`, etc.), not at the translation call.
