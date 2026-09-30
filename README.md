# Time logger

A single-user desktop app for logging worked hours and generating the monthly
activity report, invoice and Odoo CSV export.

The UI is Svelte (`client3/`), wrapped in a native webview with
[Tauri](https://tauri.app) (`client3/src-tauri/`). All data is stored locally in
the webview's IndexedDB; there is no server.

## Backups

Your data lives only on your machine. Use **Backup** in the top bar to save
everything (including signatures) to a JSON file, and **Restore** to load one.
Restore replaces all current data.

Moving from the old PocketBase server:

```sh
cd client3
node scripts/export-from-pocketbase.mjs https://your-old-server you@example.com
```

It asks for your password and writes `time-logger-backup-from-server.json`; load
it with **Restore**.

## Development

Prerequisites: Node 18+, Rust (via [rustup](https://rustup.rs)) and the
[Tauri system dependencies](https://tauri.app/start/prerequisites/) for your OS.

```sh
make dev      # desktop app with hot reload
make build    # installers for the current OS -> client3/src-tauri/target/release/bundle/
make run-web  # frontend only, in a browser at http://localhost:5173
```

## Release builds

`.github/workflows/build.yml` builds macOS (universal .dmg), Linux (.deb, .rpm,
.AppImage) and Windows (.msi, .exe) installers on GitHub-hosted runners.

- Run it manually from the Actions tab: installers are attached to the run as artifacts.
- Push a tag such as `v0.1.0`: installers are also added to a draft GitHub release.

The builds are not code-signed. On macOS, the first launch is blocked by
Gatekeeper; right-click the app and choose **Open**, or run
`xattr -cr "/Applications/Time logger.app"`. On Windows, SmartScreen shows a
warning; choose **More info → Run anyway**.
