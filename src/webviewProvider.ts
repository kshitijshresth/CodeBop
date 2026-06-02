import * as vscode from 'vscode';
import * as path from 'path';

export class CodeBopWebviewProvider {
	private panel: vscode.WebviewPanel | undefined;
	private context: vscode.ExtensionContext;
	private onPlayToggleCallback: (() => void) | undefined;
	private currentTrack: string = 'Default: the_mountain-background-music-159125';
	private currentTrackUri: string = '';
	private isPlaying: boolean = false;
	private userTracks: string[] = [];

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		const savedTrack = context.globalState.get<string>('codebop.lastTrack');
		if (savedTrack) {
			this.currentTrack = savedTrack;
		}
		this.scanUserFolder();
	}

	private get soundsStorageUri(): vscode.Uri {
		return vscode.Uri.joinPath(this.context.globalStorageUri, 'sounds');
	}

	private async ensureStorageExists() {
		try {
			await vscode.workspace.fs.createDirectory(this.soundsStorageUri);
		} catch (e) {
			// Ignore if directory already exists
		}
	}

	public setOnPlayToggle(callback: () => void) {
		this.onPlayToggleCallback = callback;
	}

	public updatePlayState(isPlaying: boolean) {
		this.isPlaying = isPlaying;
		if (this.panel) {
			this.panel.webview.postMessage({
				type: 'updatePlayState',
				isPlaying: isPlaying
			});
		}
	}

	public updateTrack(trackName: string, trackUri?: string) {
		this.currentTrack = trackName;
		if (trackUri) {
			this.currentTrackUri = trackUri;
		}
		this.context.globalState.update('codebop.lastTrack', trackName);
		if (this.panel) {
			this.panel.webview.postMessage({
				type: 'updateTrack',
				trackName: trackName,
				trackUri: trackUri || this.currentTrackUri
			});
		}
	}

	public openPanel() {
		if (this.panel) {
			this.panel.reveal(vscode.ViewColumn.Two);
			return;
		}

		this.panel = vscode.window.createWebviewPanel(
			'codebopPanel',
			'CodeBop',
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.joinPath(this.context.extensionUri, 'media'),
					this.soundsStorageUri
				]
			}
		);

		const defaultTrackUri = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'the_mountain-background-music-159125.mp3');
		const defaultTrackWebviewUri = this.panel.webview.asWebviewUri(defaultTrackUri).toString();
		
		this.panel.webview.html = this.getWebviewContent(defaultTrackWebviewUri);

		this.panel.webview.onDidReceiveMessage(
			message => {
				switch (message.type) {
					case 'playToggle':
						if (this.onPlayToggleCallback) {
							this.onPlayToggleCallback();
						}
						break;
					case 'chooseFolder':
						this.handleFolderSelection();
						break;
					case 'selectTrack':
						this.handleTrackSelection(message.trackPath);
						break;
				}
			},
			undefined,
			this.context.subscriptions
		);

		this.panel.onDidDispose(
			() => {
				this.panel = undefined;
			},
			undefined,
			this.context.subscriptions
		);
	}

	private async handleFolderSelection() {
		const result = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: true,
			openLabel: 'Add Sound File(s)',
			filters: {
				'Audio/Video': ['mp3', 'mp4', 'wav', 'ogg', 'm4a', 'webm']
			}
		});

		if (result && result.length > 0) {
			await this.ensureStorageExists();
			try {
				for (const fileUri of result) {
					const destUri = vscode.Uri.joinPath(this.soundsStorageUri, path.basename(fileUri.fsPath));
					await vscode.workspace.fs.copy(fileUri, destUri, { overwrite: true });
				}
				vscode.window.showInformationMessage(`Added ${result.length} track(s) to CodeBop!`);
				this.scanUserFolder();
			} catch (err) {
				vscode.window.showErrorMessage(`Failed to add tracks: ${err}`);
			}
		}
	}

	private async scanUserFolder() {
		try {
			await this.ensureStorageExists();
			const files = await vscode.workspace.fs.readDirectory(this.soundsStorageUri);
			
			this.userTracks = files
				.filter(([name, type]) => type === vscode.FileType.File && name.toLowerCase().match(/\.(mp3|mp4|wav|ogg|m4a|webm)$/))
				.map(([name]) => vscode.Uri.joinPath(this.soundsStorageUri, name).fsPath);

			if (this.panel) {
				const trackUris = this.userTracks.map(trackPath => {
					const uri = vscode.Uri.file(trackPath);
					return {
						name: path.basename(trackPath),
						uri: this.panel!.webview.asWebviewUri(uri).toString()
					};
				});

				this.panel.webview.postMessage({
					type: 'updateTrackList',
					tracks: trackUris
				});
			}
		} catch (error) {
			console.error(`Failed to scan storage: ${error}`);
		}
	}

	private handleTrackSelection(trackPath: string) {
		const trackName = path.basename(trackPath);
		this.updateTrack(trackName, trackPath);
	}

	private getWebviewContent(defaultTrackUri: string): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src vscode-webview-resource: https: data: blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
	<title>CodeBop</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
			padding: 20px;
			margin: 0;
		}
		.container {
			max-width: 500px;
			margin: 0 auto;
		}
		h1 {
			font-size: 24px;
			font-weight: 600;
			margin-bottom: 30px;
			color: var(--vscode-foreground);
		}
		.track-info {
			background-color: var(--vscode-input-background);
			border: 1px solid var(--vscode-input-border);
			border-radius: 4px;
			padding: 16px;
			margin-bottom: 20px;
		}
		.track-label {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			margin-bottom: 8px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.track-name {
			font-size: 14px;
			color: var(--vscode-foreground);
			word-break: break-word;
		}
		.controls {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		button {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			padding: 12px 20px;
			font-size: 14px;
			cursor: pointer;
			transition: background-color 0.1s;
		}
		button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		button:active {
			opacity: 0.9;
		}
		#playPauseBtn {
			font-size: 16px;
			font-weight: 600;
			padding: 16px 24px;
		}
		#chooseFolderBtn {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}
		#chooseFolderBtn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>CodeBop</h1>
		
		<div class="track-info">
			<div class="track-label">Current Track</div>
			<div class="track-name" id="trackName">${this.currentTrack}</div>
		</div>

		<div class="controls">
			<button id="playPauseBtn">${this.isPlaying ? 'Pause' : 'Play'}</button>
			<button id="chooseFolderBtn">Add Sounds...</button>
		</div>
	</div>

	<audio id="audioPlayer" loop></audio>

	<script>
		const vscode = acquireVsCodeApi();
		const playPauseBtn = document.getElementById('playPauseBtn');
		const chooseFolderBtn = document.getElementById('chooseFolderBtn');
		const trackName = document.getElementById('trackName');
		const audioPlayer = document.getElementById('audioPlayer');

		let currentTrackUri = '${defaultTrackUri}';
		
		// Set audio source immediately
		audioPlayer.src = currentTrackUri;
		audioPlayer.load();
		
		// Add error handler
		audioPlayer.addEventListener('error', (e) => {
			console.error('Audio error:', e, audioPlayer.error);
		});

		playPauseBtn.addEventListener('click', () => {
			if (audioPlayer.paused) {
				audioPlayer.play().then(() => {
					console.log('Playback started successfully');
				}).catch(err => {
					console.error('Playback failed:', err);
					alert('Failed to play audio: ' + err.message);
				});
			} else {
				audioPlayer.pause();
			}
			vscode.postMessage({ type: 'playToggle' });
		});

		chooseFolderBtn.addEventListener('click', () => {
			vscode.postMessage({ type: 'chooseFolder' });
		});

		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.type) {
				case 'updatePlayState':
					const isPlaying = message.isPlaying;
					playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
					if (isPlaying && audioPlayer.paused) {
						audioPlayer.play().catch(err => console.error('Playback failed:', err));
					} else if (!isPlaying && !audioPlayer.paused) {
						audioPlayer.pause();
					}
					break;
				case 'updateTrack':
					trackName.textContent = message.trackName;
					if (message.trackUri) {
						const wasPlaying = !audioPlayer.paused;
						currentTrackUri = message.trackUri;
						audioPlayer.src = currentTrackUri;
						if (wasPlaying) {
							audioPlayer.play().catch(err => console.error('Playback failed:', err));
						}
					}
					break;
				case 'updateTrackList':
					console.log('Available tracks:', message.tracks);
					break;
			}
		});

		audioPlayer.addEventListener('ended', () => {
			audioPlayer.currentTime = 0;
			audioPlayer.play().catch(err => console.error('Loop playback failed:', err));
		});
	</script>
</body>
</html>`;
	}
}
