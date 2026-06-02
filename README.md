# CodeBop

**CodeBop** is a VS Code extension that plays ambient background music while you code. Create a calm, focused coding environment with seamless audio loops—perfect for deep work sessions.

## Features

- 🎵 **Ambient Background Music** - Play soothing ambient tracks while coding
- 🔁 **Seamless Looping** - Tracks loop continuously without interruption
- 📁 **Custom Sound Library** - Choose your own folder of MP3 files
- 🎛️ **Simple Controls** - Play/stop from status bar or command palette
- 💾 **Persistent State** - Remembers your last track and folder across sessions
- 🎨 **Clean UI** - Minimal webview panel with VS Code theming

## Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "CodeBop"
4. Click **Install**

### From VSIX File

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click the `...` menu → **Install from VSIX...**
5. Select the downloaded `.vsix` file

## Usage

### Quick Start

1. **Open the CodeBop Panel**
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open Command Palette
   - Type "CodeBop: Open Panel"
   - Or click the `$(play) CodeBop` status bar item (bottom right)

2. **Play Default Track**
   - Click the **Play** button in the panel
   - Or run command: "CodeBop: Play"
   - The default ambient track will start playing and loop

3. **Stop Playback**
   - Click the **Pause** button in the panel
   - Or run command: "CodeBop: Stop"
   - Or click the status bar item when playing

### Adding Your Own Sounds

1. **Choose Your Sounds Folder**
   - Open the CodeBop panel
   - Click **Choose My Sounds Folder**
   - Select a folder containing your MP3 files

2. **Your folder will be saved** and scanned for `.mp3` files automatically

3. **Switch Tracks** (future feature)
   - Track selection UI coming soon
   - For now, the extension will remember your last played track

### Commands

All commands are available via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **CodeBop: Play** - Start playing ambient music
- **CodeBop: Stop** - Stop playback
- **CodeBop: Open Panel** - Open the CodeBop control panel

### Status Bar

The CodeBop status bar item (bottom right) shows the current state:
- `$(play) CodeBop` - Click to play
- `$(pause) CodeBop` - Click to stop

## Requirements

- VS Code version `^1.80.0` or higher
- MP3 files for custom sounds (optional)

## Extension Settings

CodeBop stores the following in your VS Code settings:
- Last played track name
- User sounds folder path

These are persisted in `globalState` and restored when VS Code restarts.

## Known Issues

- Track selection from user folder not yet implemented in UI (coming soon)
- Only MP3 format supported currently

## Release Notes

### 0.0.1

Initial release of CodeBop:
- Default ambient track included
- Play/Stop controls via status bar and commands
- Custom sounds folder selection
- Seamless audio looping
- Clean webview panel UI
- State persistence across sessions

## For Developers

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd CodeBop

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Packaging

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Package the extension
npm run package
# or
vsce package

# This creates codebop-0.0.1.vsix
```

### Publishing

```bash
# Login with your publisher ID
vsce login CodeBop

# Publish to marketplace
vsce publish

# Or publish with version bump
vsce publish patch  # 0.0.1 -> 0.0.2
vsce publish minor  # 0.0.1 -> 0.1.0
vsce publish major  # 0.0.1 -> 1.0.0
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This extension is licensed under the [MIT License](LICENSE).

## Credits

Default ambient track: "The Mountain" background music

---

**Enjoy coding with CodeBop!** 🎵✨
