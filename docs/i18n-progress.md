# i18n progress

## 2026-07-20

- Routed static estate and publish component chrome through the existing namespace translation hooks.
- Preserved property data, article content, prices, addresses, and other runtime values as dynamic data.
- Added the corresponding `en`, `ja`, and `zh` keys in the host i18n locale package.
- Estate terminology follows Japanese real-estate usage; publish terminology follows publishing and news usage.
- Migrated the estate namespace from Japanese source-text keys to English semantic keys across all literal `t()` calls.
- Verified that all literal estate translation keys exist and are non-empty in `en`, `ja`, and `zh`; no Japanese locale keys remain.
