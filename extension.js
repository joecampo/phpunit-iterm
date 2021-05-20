const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  const runTestsForFile = vscode.commands.registerCommand('phpunit-iterm.runTestsForFile', runTestsForFileExec);
  context.subscriptions.push(runTestsForFile);

  const runTestMethod = vscode.commands.registerCommand('phpunit-iterm.runTestMethod', runTestMethodExec);
  context.subscriptions.push(runTestMethod);
}

exports.activate = activate;

function runTestsForFileExec() {
  _executeCodeViaChildProcess(`cd ${_rootPath()} && ./vendor/bin/phpunit ${_fileName()}`);
}

function runTestMethodExec() {
  _executeCodeViaChildProcess(
    `cd ${_rootPath()} && ./vendor/bin/phpunit ${_fileName()} --filter ${_currentTestMethodName()}`,
  );
}

function _rootPath() {
  return vscode.workspace.rootPath;
}

function _fileName() {
  return vscode.window.activeTextEditor.document.fileName;
}
function _currentTestMethodName() {
  let line = vscode.window.activeTextEditor.selection.active.line;

  while (line > 0) {
    const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
    const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);

    if (match) return match[1];

    line--;
  }
}

function _executeCodeViaChildProcess(code) {
  const activateCommand =
    vscode.workspace.getConfiguration('runInIterm').get('activateWindow') === true ? ` -e 'activate' ` : '';

  const command =
    `osascript ` +
    ` -e 'tell app "iTerm"' ` +
    ` -e 'reopen' ` +
    activateCommand +
    ` -e 'set mysession to current session of current window' ` +
    ` -e 'tell mysession to write text "${code}"' ` +
    ` -e 'end tell'`;

  exec(command);
}
