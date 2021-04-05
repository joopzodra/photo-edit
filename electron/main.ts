import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

if(require('electron-squirrel-startup')) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return;
}

// TODO fix missing env variable
// const isDevelopment = process.env.NODE_ENV !== 'production';
const isDevelopment = false;
const windows = new Map();

const createWindow = () => {
  let x;
  let y;

  const currentWindow = BrowserWindow.getFocusedWindow();

  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 20;
    y = currentWindowY + 20;
  }

  let newWindow: BrowserWindow | null = new BrowserWindow({
    x,
    y,
    show: false,
    width: 1400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDevelopment) {
    newWindow.webContents.openDevTools();
  }

  // TODO how to get env variable with webpack devserver port?
  const devServerPort = process.env.WEBPACK_DEVSERVER_PORT || 4200;
  const appUrl = isDevelopment
    ? `http://localhost:${devServerPort}`
    : `file://${path.join(__dirname, '../dist/photo-edit/index.html')}`;

  newWindow.loadURL(appUrl).catch(err => console.log(err));

  newWindow.once('ready-to-show', () => {
    (newWindow as BrowserWindow).show();
  });

  // newWindow.on('close', (event) => {
  //     if (windows.get(newWindow?.id).isEdited) {
  //         event.preventDefault();
  //
  //         const result = dialog.showMessageBoxSync((newWindow as BrowserWindow), {
  //             type: 'warning',
  //             title: 'Quit with Unsaved Changes?',
  //             message: 'Your changes will be lost if you do not save.',
  //             buttons: [
  //                 'Quit Anyway',
  //                 'Cancel',
  //             ],
  //             defaultId: 0,
  //             cancelId: 1
  //         });
  //
  //         if (result === 0) {
  //             windows.delete(newWindow?.id);
  //             newWindow!.destroy();
  //         }
  //     }
  // });

  newWindow.on('closed', () => {
    if (!newWindow?.isDestroyed()) {
      windows.delete(newWindow?.id);
    }
    // TODO add this?
    // stopWatchingFile((newWindow as BrowserWindow));
    newWindow = null;
  });

  windows.set(newWindow.id, {window: newWindow, isEdited: false});
  return newWindow;
};

const openFile = (targetWindow: BrowserWindow, filePath: string) => {
  app.addRecentDocument(filePath);
  targetWindow.setRepresentedFilename(filePath);

  const content = fs.readFileSync(filePath, 'base64');

  targetWindow.webContents.send('file-opened', filePath, content);
  // startWatchingFile(targetWindow, filePath);
};

const getFileFromUser = (focussedWindow?: BrowserWindow) => {
  const targetWindow = focussedWindow || BrowserWindow.getFocusedWindow();

  // if (windows.get(targetWindow?.id).isEdited) {
  //   const result = dialog.showMessageBoxSync((targetWindow as BrowserWindow), {
  //     type: 'warning',
  //     title: 'Overwrite Current Unsaved Changes?',
  //     message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
  //     buttons: [
  //       'Yes',
  //       'Cancel',
  //     ],
  //     defaultId: 0,
  //     cancelId: 1
  //   });
  //
  //   if (result === 1) {
  //     return;
  //   }
  // }

  const filePaths = dialog.showOpenDialogSync((targetWindow as BrowserWindow), {
    properties: ['openFile'],
    filters: [
      {name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif']},
      {name: 'All Files', extensions: ['*']},
    ]
  });

  if (filePaths) {
    app.addRecentDocument(filePaths[0]);
    targetWindow?.setRepresentedFilename(filePaths[0]);
    openFile((targetWindow as BrowserWindow), filePaths[0]);
  }
};

const processFileRequest = (targetWindow: BrowserWindow, filePath: string) => {
  // const resolvedPath = path.resolve('"C:/Program Files/ImageMagick-7.0.11-Q16-HDRI/magick.exe"');
  const joinedPath = path.join('"C:/Program Files/ImageMagick-7.0.11-Q16-HDRI/magick.exe"')
  const pathOut = path.join('"D:/joopr/Pictures/lionTEST.jpg"')
  console.log(joinedPath);

exec(`${joinedPath} "${filePath}" -resize "20%" ${pathOut}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
}

const clearEditor = () => {
  const targetWindow = BrowserWindow.getFocusedWindow();
  (targetWindow as BrowserWindow).webContents.send('clear-editor');
};

app.whenReady().then(() => {
  // Menu.setApplicationMenu(appMenu);
  createWindow();

  app.on('activate', (event: Electron.Event, hasVisibleWindows: boolean) => {
    if (!hasVisibleWindows) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('button-action', (event, action) => {
  switch (action) {
    case'Open':
      getFileFromUser();
      break;
    case 'Clear':
      clearEditor();
      break;
    default:
  }
});
