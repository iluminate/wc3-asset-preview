import * as vscode from "vscode";
import { AssetLinkProvider } from "./providers/assetLinkProvider";
import { WarcraftColorProvider } from "./providers/colorProvider";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerColorProvider(
            [{ scheme: "file" }],
            new WarcraftColorProvider()
        ),
        vscode.languages.registerDocumentLinkProvider(
            [{ scheme: "file" }],
            new AssetLinkProvider()
        )
    );
}

export function deactivate() { }
