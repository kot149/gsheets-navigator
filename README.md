# Sheets Navigator for Google Sheets

A UserScript to add the feature to search and jump sheets in Google Sheets without touching the mouse.

![image](https://github.com/user-attachments/assets/e0bcf014-ff90-4849-a9c0-d2ca7e5a93e6)

## Installation

1. Install [Tampermonkey](https://tampermonkey.net/)
2. Install the UserScript:
   - [Download from Releases](https://github.com/kot149/gsheets-navigator/releases)
   - Or [Direct Install](https://github.com/kot149/gsheets-navigator/releases/latest/download/gsheets-navigator.user.js)

## Usage

1. Open any Google Sheets document
2. Press `Ctrl + Space` to open the navigator
3. Type to search and use arrow keys to select a sheet
4. Press `Enter` to switch sheets or `Escape` to close

## Development

1. Install [Bun](https://bun.sh/)
2. Install dependencies
   ```sh
   bun install
   ```
3. Run in development mode
   ```sh
   bun run dev
   ```
4. Build
   ```sh
   bun run build
   ```

**Tech Stack:** React, TypeScript, Tailwind CSS, Vite
