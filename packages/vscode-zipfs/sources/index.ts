import {npath}         from '@yarnpkg/fslib';
import * as vscode     from 'vscode';

import {ZipFSProvider} from './ZipFSProvider';

function mount(uri: vscode.Uri) {
  const zipUri = vscode.Uri.parse(`zip:${uri.fsPath}`);

  if (vscode.workspace.getWorkspaceFolder(zipUri) === undefined) {
    vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders!.length, 0, {
      name: npath.basename(zipUri.fsPath),
      uri: zipUri,
    });
  }
}

type Link = {
  startIndex: number;
  length: number;
  tooltip: string;
  data: string;
}

export function activate(context: vscode.ExtensionContext) {
  // @ts-expect-error - Types are not up to date
  vscode.window.registerTerminalLinkProvider({
    // @ts-expect-error - Types are not up to date
    provideTerminalLinks: context => {
      const line = context.line as string;
      const startIndex = line.indexOf(`.yarn/$$virtual`);
      if (startIndex === -1) return [];

      const linkResult: Array<Link> = [];

      const matcher = /[^\s]*\.yarn\/\$\$virtual[^\s]+/g;
      let match: RegExpExecArray | null = null;
      while ((match = matcher.exec(line))) {
        linkResult.push({
          startIndex: match.index,
          length: match[0].length,
          data: match[0],
          tooltip: `Open file in editor`,
        });
      }

      return linkResult;
    },
    handleTerminalLink: async (link: Link) => {
      const selectors = link.data.match(/(:(\d+))(:(\d+))?$/);

      let selection: vscode.Range | undefined = undefined;
      if (selectors) {
        const startLine = Math.max(Number(selectors[2]) - 1, 0);
        const startColumn = Math.max(Number(selectors[4] ?? 0) - 1, 0);
        selection = new vscode.Range(startLine, startColumn, startLine, startColumn);
      }

      await vscode.window.showTextDocument(
        vscode.Uri.parse(`zip:${link.data.substr(0, selectors?.index).replace(/^\/?/, `/`)}`),
        {
          selection,
        }
      );
    },
  });

  context.subscriptions.push(vscode.workspace.registerFileSystemProvider(`zip`, new ZipFSProvider(), {
    isCaseSensitive: true,
  }));

  context.subscriptions.push(vscode.commands.registerCommand(`zipfs.mountZipFile`, (uri: vscode.Uri) => {
    mount(uri);
  }));

  context.subscriptions.push(vscode.commands.registerCommand(`zipfs.mountZipEditor`, () => {
    mount(vscode.window.activeTextEditor!.document.uri);
  }));
}
