import * as vscode from 'vscode';
import { CodeBopWebviewProvider } from './webviewProvider';

let isPlaying: boolean = false;
let statusBarItem: vscode.StatusBarItem;
let webviewProvider: CodeBopWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
	console.log('CodeBop extension is now active');

	webviewProvider = new CodeBopWebviewProvider(context);

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'codebop.play';
	updateStatusBar();
	statusBarItem.show();

	webviewProvider.setOnPlayToggle(() => {
		if (isPlaying) {
			vscode.commands.executeCommand('codebop.stop');
		} else {
			vscode.commands.executeCommand('codebop.play');
		}
	});

	const playCommand = vscode.commands.registerCommand('codebop.play', () => {
		if (!isPlaying) {
			isPlaying = true;
			updateStatusBar();
			webviewProvider.updatePlayState(true);
		}
	});

	const stopCommand = vscode.commands.registerCommand('codebop.stop', () => {
		isPlaying = false;
		updateStatusBar();
		webviewProvider.updatePlayState(false);
	});

	const openPanelCommand = vscode.commands.registerCommand('codebop.openPanel', () => {
		webviewProvider.openPanel();
	});

	context.subscriptions.push(playCommand);
	context.subscriptions.push(stopCommand);
	context.subscriptions.push(openPanelCommand);
	context.subscriptions.push(statusBarItem);
}

function updateStatusBar() {
	if (isPlaying) {
		statusBarItem.text = '$(debug-pause) CodeBop';
		statusBarItem.tooltip = 'CodeBop: Stop ambient sound';
		statusBarItem.command = 'codebop.stop';
	} else {
		statusBarItem.text = '$(play) CodeBop';
		statusBarItem.tooltip = 'CodeBop: Play ambient sound';
		statusBarItem.command = 'codebop.play';
	}
}

export function deactivate() {
	console.log('CodeBop extension is now deactivated');
	isPlaying = false;
}
