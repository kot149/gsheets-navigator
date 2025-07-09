# Sheets Navigator for Google Sheets

A UserScript to add the feature to search and jump sheets in Google Sheets.

![image](https://github.com/user-attachments/assets/e35cebd9-bd34-4455-ba20-e05ace19903f)

## Installation

1. Install [Tampermonkey](https://tampermonkey.net/)
2. Install the UserScript:
   - [Download from Releases](https://github.com/kot149/gsheets-navigator/releases)
   - Or [Direct Install](https://github.com/kot149/gsheets-navigator/releases/download/latest/gsheets-navigator.user.js)

## Usage

1. Open any Google Sheets document
2. Press `Ctrl + Space` to open the navigator
3. Type to search or use arrow keys to navigate
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
