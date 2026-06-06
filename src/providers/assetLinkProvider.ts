import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const ASSET_REGEX = /"(war3mapImported\\\\[^"]+)"/g;

export class AssetLinkProvider implements vscode.DocumentLinkProvider {
    private cachedMapRoot: string | null = null;

    provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();
        let match: RegExpExecArray | null;

        while ((match = ASSET_REGEX.exec(text)) !== null) {
            const resolved = this.resolveAsset(match[1]);
            if (!resolved) continue;

            const start = document.positionAt(match.index + 1);
            const end = document.positionAt(match.index + 1 + match[1].length);

            links.push(
                new vscode.DocumentLink(
                    new vscode.Range(start, end),
                    vscode.Uri.file(resolved)
                )
            );
        }

        return links;
    }

    private resolveAsset(assetPath: string): string | null {
        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) return null;

        if (!this.cachedMapRoot) {
            this.cachedMapRoot = this.findWar3MapRoot(workspace.uri.fsPath);
        }

        if (!this.cachedMapRoot) return null;

        const fullPath = path.join(
            this.cachedMapRoot,
            assetPath.replace(/\\\\/g, path.sep)
        );

        return fs.existsSync(fullPath) ? fullPath : null;
    }

    private findWar3MapRoot(root: string): string | null {
        const stack = [root];

        while (stack.length > 0) {
            const current = stack.pop()!;
            const imported = path.join(current, "war3mapImported");

            if (fs.existsSync(imported)) {
                return current;
            }

            try {
                const children = fs.readdirSync(current, { withFileTypes: true });
                for (const child of children) {
                    if (child.isDirectory() && child.name !== "node_modules" && !child.name.startsWith(".")) {
                        stack.push(path.join(current, child.name));
                    }
                }
            } catch {
                // skip unreadable directories
            }
        }

        return null;
    }
}
