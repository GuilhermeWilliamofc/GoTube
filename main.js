const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');

const VideoModel = require('./app/models/VideoModel');
const DownloadController = require('./app/controllers/DownloadController');

let mainWindow;

// Diretorios persistentes
const DOWNLOADS_DIR = path.join(os.homedir(), 'Videos', 'goTube');
const DATA_DIR = path.join(os.homedir(), 'Videos', 'goTube', '.data');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        title: "goTube",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        backgroundColor: '#0f0f0f',
        icon: path.join(__dirname, 'app', 'assets', 'icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'app', 'views', 'index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Inicializar Model
    const videoModel = new VideoModel(DATA_DIR);

    // Escanear disco para importar videos que existem mas nao estao no JSON
    videoModel.scanDownloadsDir(DOWNLOADS_DIR);

    // Inicializar Controller (conecta IPC, Model e Python)
    new DownloadController(ipcMain, videoModel, DOWNLOADS_DIR, dialog, mainWindow);

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
