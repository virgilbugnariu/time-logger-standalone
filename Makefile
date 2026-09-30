install:
	cd ./client3 && npm install

# Desktop app with hot reload
dev: install
	cd ./client3 && npm run tauri dev

# Installers for the current OS, written to client3/src-tauri/target/release/bundle/
build: install
	cd ./client3 && npm run tauri build

# Frontend only, in a normal browser (data is stored in that browser's IndexedDB)
run-web: install
	cd ./client3 && npm run dev

.PHONY: install dev build run-web
