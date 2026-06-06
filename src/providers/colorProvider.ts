import * as vscode from "vscode";

const COLOR_REGEX = /\|c([0-9a-fA-F]{8})/g;

export class WarcraftColorProvider implements vscode.DocumentColorProvider {
    provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
        const colors: vscode.ColorInformation[] = [];
        const text = document.getText();
        let match: RegExpExecArray | null;

        while ((match = COLOR_REGEX.exec(text)) !== null) {
            const hex = match[1];
            const start = document.positionAt(match.index);
            const end = document.positionAt(match.index + match[0].length);

            colors.push(
                new vscode.ColorInformation(
                    new vscode.Range(start, end),
                    new vscode.Color(
                        parseInt(hex.substring(2, 4), 16) / 255,
                        parseInt(hex.substring(4, 6), 16) / 255,
                        parseInt(hex.substring(6, 8), 16) / 255,
                        1
                    )
                )
            );
        }

        return colors;
    }

    provideColorPresentations(color: vscode.Color): vscode.ColorPresentation[] {
        const toHex = (n: number) =>
            Math.round(n * 255).toString(16).padStart(2, "0");

        return [
            new vscode.ColorPresentation(
                `|c00${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`
            ),
        ];
    }
}
