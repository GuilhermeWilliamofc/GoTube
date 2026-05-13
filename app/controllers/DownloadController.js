const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class DownloadController {
    constructor(ipcMain, videoModel, downloadsDir, dialog, mainWindow) {
        this.ipcMain = ipcMain;
        this.videoModel = videoModel;
        this.downloadsDir = downloadsDir;
        this.dialog = dialog;
        this.mainWindow = mainWindow;
        
        // Define o caminho do script Python tratando o caso de build (asarUnpack)
        const scriptPath = path.join(__dirname, '..', 'scripts', 'baixar_youtube.py');
        this.pythonScript = this._getUnpackedPath(scriptPath);
        
        this._ensureDownloadsDir();
        this.setupListeners();
    }

    _getUnpackedPath(filePath) {
        return filePath.replace('app.asar', 'app.asar.unpacked');
    }

    _ensureDownloadsDir() {
        if (!fs.existsSync(this.downloadsDir)) {
            fs.mkdirSync(this.downloadsDir, { recursive: true });
        }
    }

    setupListeners() {
        this.ipcMain.on('start-download', (event, { url, qualidade }) => {
            console.log(`Iniciando download: ${url} qualidade: ${qualidade}`);
            
            const pyProcess = spawn('python', [
                this.pythonScript,
                url,
                qualidade || '1080p',
                this.downloadsDir
            ], {
                // Forcar UTF-8 na comunicacao com o Python
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            });

            let pendingMetadata = null;

            pyProcess.stdout.on('data', (data) => {
                // Decodificar como UTF-8 explicitamente
                const rawMessage = data.toString('utf-8').trim();
                
                // Pode ter multiplas linhas em um unico chunk
                const lines = rawMessage.split('\n');
                
                for (const line of lines) {
                    const message = line.trim();
                    if (!message) continue;

                    console.log(`[Python]: ${message}`);

                    if (message.startsWith('PROGRESS:')) {
                        const prog = parseFloat(message.substring(9));
                        if (!isNaN(prog)) {
                            event.reply('download-progress', { url, progress: prog });
                        }
                    } else if (message.startsWith('STATUS:')) {
                        const status = message.substring(7);
                        event.reply('download-status', { url, status });
                    } else if (message.startsWith('TITLE:')) {
                        const title = message.substring(6);
                        event.reply('download-info', { url, title });
                    } else if (message.startsWith('QUALITY:')) {
                        const quality = message.substring(8);
                        event.reply('download-quality', { url, quality });
                    } else if (message.startsWith('THUMBNAIL:')) {
                        // Thumbnail path relativo a downloadsDir
                    } else if (message.startsWith('METADATA:')) {
                        try {
                            const jsonStr = message.substring(9);
                            pendingMetadata = JSON.parse(jsonStr);
                        } catch (err) {
                            console.error('Erro ao parsear metadados:', err.message);
                        }
                    } else if (message.startsWith('DONE:')) {
                        const filePath = message.substring(5);
                        
                        // Registrar no Model
                        if (pendingMetadata) {
                            const savedVideo = this.videoModel.addVideo(pendingMetadata);
                            event.reply('download-complete', { 
                                url, 
                                filePath, 
                                video: savedVideo 
                            });
                        } else {
                            event.reply('download-complete', { url, filePath });
                        }
                    } else if (message.startsWith('ERROR:')) {
                        const error = message.substring(6);
                        event.reply('download-error', { url, error });
                    }
                }
            });

            pyProcess.stderr.on('data', (data) => {
                const errMsg = data.toString('utf-8');
                console.error(`[Python stderr]: ${errMsg}`);
                // Nao enviar stderr como erro para a UI (pytubefix emite warnings no stderr)
            });

            pyProcess.on('close', (code) => {
                console.log(`Processo Python finalizado com codigo ${code}`);
                if (code !== 0) {
                    event.reply('download-error', { url, error: `Processo encerrado com codigo ${code}` });
                }
            });

            pyProcess.on('error', (err) => {
                console.error('Erro ao iniciar processo Python:', err);
                event.reply('download-error', { url, error: `Erro ao iniciar Python: ${err.message}` });
            });
        });

        // Listar videos da biblioteca
        this.ipcMain.on('get-all-videos', (event) => {
            const videos = this.videoModel.getAllVideos();
            event.reply('all-videos', videos);
        });

        // Buscar videos
        this.ipcMain.on('search-videos', (event, query) => {
            const results = this.videoModel.searchVideos(query);
            event.reply('search-results', results);
        });

        // Obter recomendacoes
        this.ipcMain.on('get-recommendations', (event, videoId) => {
            const recs = this.videoModel.getRecommendations(videoId);
            event.reply('recommendations', recs);
        });

        // Obter video por ID
        this.ipcMain.on('get-video', (event, videoId) => {
            const video = this.videoModel.getVideoById(videoId);
            event.reply('video-data', video);
        });

        // Retorna o caminho base dos downloads
        this.ipcMain.on('get-downloads-dir', (event) => {
            event.reply('downloads-dir', this.downloadsDir);
        });

        // Atualizar video
        this.ipcMain.on('update-video', (event, { videoId, updates }) => {
            const updated = this.videoModel.updateVideo(videoId, updates);
            if (updated) {
                event.reply('video-updated', { success: true, video: updated });
                // Enviar lista atualizada para todos
                event.reply('all-videos', this.videoModel.getAllVideos());
            } else {
                event.reply('video-updated', { success: false, error: 'Video nao encontrado' });
            }
        });

        // Deletar video
        this.ipcMain.on('delete-video', (event, videoId) => {
            const success = this.videoModel.removeVideo(videoId);
            if (success) {
                event.reply('video-deleted', { success: true, videoId });
                // Enviar lista atualizada para todos
                event.reply('all-videos', this.videoModel.getAllVideos());
            } else {
                event.reply('video-deleted', { success: false, error: 'Erro ao deletar video' });
            }
        });

        // Marcar como assistido (History)
        this.ipcMain.on('mark-as-watched', (event, videoId) => {
            this.videoModel.markAsWatched(videoId);
            event.reply('all-videos', this.videoModel.getAllVideos());
        });

        // Interacao Local (Like/Dislike)
        this.ipcMain.on('set-interaction', (event, { videoId, interaction }) => {
            const updated = this.videoModel.setInteraction(videoId, interaction);
            if (updated) {
                event.reply('interaction-updated', { success: true, video: updated });
                event.reply('all-videos', this.videoModel.getAllVideos());
            }
        });

        // Selecionar Avatar do Canal manualmente
        this.ipcMain.on('pick-channel-avatar', async (event, videoId) => {
            const video = this.videoModel.getVideoById(videoId);
            if (!video) return;

            const result = await this.dialog.showOpenDialog(this.mainWindow, {
                properties: ['openFile'],
                filters: [{ name: 'Imagens', extensions: ['jpg', 'png', 'jpeg', 'webp'] }]
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const srcPath = result.filePaths[0];
                const videoFolderPath = path.dirname(video.filePath);
                const ext = path.extname(srcPath);
                const destFileName = `channel_avatar${ext}`;
                const destPath = path.join(videoFolderPath, destFileName);

                try {
                    fs.copyFileSync(srcPath, destPath);
                    // Atualizar metadados
                    const avatarRelative = path.join(video.folderName, destFileName);
                    video.channelAvatarRelative = avatarRelative;
                    this.videoModel.addVideo(video); // Salva no JSON

                    event.reply('avatar-picked', { success: true, avatarRelative });
                    event.reply('all-videos', this.videoModel.getAllVideos());
                } catch (err) {
                    event.reply('avatar-picked', { success: false, error: err.message });
                }
            }
        });
    }
}

module.exports = DownloadController;
