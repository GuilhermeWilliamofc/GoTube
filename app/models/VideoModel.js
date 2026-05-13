const fs = require('fs');
const path = require('path');

class VideoModel {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.dbPath = path.join(dataDir, 'library.json');
        this._ensureDataDir();
        this.library = this._load();
    }

    _ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    _load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const raw = fs.readFileSync(this.dbPath, 'utf-8');
                const data = JSON.parse(raw);
                return Array.isArray(data) ? data : [];
            }
        } catch (err) {
            console.error('Erro ao carregar library.json:', err.message);
        }
        return [];
    }

    _save() {
        try {
            const json = JSON.stringify(this.library, null, 2);
            fs.writeFileSync(this.dbPath, json, 'utf-8');
        } catch (err) {
            console.error('Erro ao salvar library.json:', err.message);
        }
    }

    /**
     * Sanitiza texto removendo caracteres proibidos.
     * Permitidos: letras (incluindo acentos), numeros, espaco, traco, underscore, parenteses, ponto, virgula
     */
    sanitizeText(text) {
        if (!text) return '';
        // Remove caracteres de controle
        let clean = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
        return clean.trim();
    }

    sanitizeFileName(name) {
        if (!name) return '';
        // Apenas letras (unicode), numeros, espaco, traco, underscore, parenteses, ponto, virgula
        let clean = name.replace(/[^\p{L}\p{N}\s()\-._,]/gu, '');
        clean = clean.replace(/ +/g, ' ').replace(/_+/g, '_');
        return clean.trim();
    }

    addVideo(metadata) {
        // Sanitizar campos de texto
        const sanitized = {
            ...metadata,
            title: this.sanitizeText(metadata.title || ''),
            channel: this.sanitizeText(metadata.channel || 'Desconhecido'),
            description: this.sanitizeText(metadata.description || ''),
            tags: Array.isArray(metadata.tags) 
                ? metadata.tags.map(t => this.sanitizeText(t)).filter(Boolean) 
                : [],
            views: metadata.views || 0,
            originalLikes: metadata.originalLikes || 0,
            userInteraction: metadata.userInteraction || null, // 'like' | 'dislike' | null
            lastWatched: metadata.lastWatched || null
        };

        // Verificar se ja existe (evitar duplicatas)
        const existingIdx = this.library.findIndex(v => v.id === sanitized.id);
        if (existingIdx >= 0) {
            this.library[existingIdx] = sanitized;
        } else {
            this.library.push(sanitized);
        }
        
        this._save();
        return sanitized;
    }

    updateVideo(videoId, updates) {
        const idx = this.library.findIndex(v => v.id === videoId);
        if (idx !== -1) {
            // Atualiza apenas os campos permitidos
            if (updates.title !== undefined) this.library[idx].title = this.sanitizeText(updates.title);
            if (updates.description !== undefined) this.library[idx].description = this.sanitizeText(updates.description);
            this._save();
            return this.library[idx];
        }
        return null;
    }

    markAsWatched(videoId) {
        const idx = this.library.findIndex(v => v.id === videoId);
        if (idx !== -1) {
            this.library[idx].lastWatched = new Date().toISOString();
            this._save();
            return this.library[idx];
        }
        return null;
    }

    setInteraction(videoId, interaction) {
        const idx = this.library.findIndex(v => v.id === videoId);
        if (idx !== -1) {
            // interaction deve ser 'like', 'dislike', ou null
            this.library[idx].userInteraction = interaction;
            this._save();
            return this.library[idx];
        }
        return null;
    }

    removeVideo(videoId) {
        const video = this.getVideoById(videoId);
        if (video) {
            // Tenta deletar a pasta do video no disco
            try {
                if (video.filePath && fs.existsSync(video.filePath)) {
                    const dirPath = path.dirname(video.filePath);
                    fs.rmSync(dirPath, { recursive: true, force: true });
                }
            } catch (err) {
                console.error(`Erro ao deletar arquivos do video ${videoId}:`, err.message);
            }
            
            // Remove do banco de dados
            this.library = this.library.filter(v => v.id !== videoId);
            this._save();
            return true;
        }
        return false;
    }

    getAllVideos() {
        // Retorna copia ordenada por data de download (mais recente primeiro)
        return [...this.library].sort((a, b) => {
            const dateA = new Date(a.downloadDate || 0);
            const dateB = new Date(b.downloadDate || 0);
            return dateB - dateA;
        });
    }

    getVideoById(videoId) {
        return this.library.find(v => v.id === videoId) || null;
    }

    searchVideos(query) {
        if (!query) return this.getAllVideos();
        const lower = query.toLowerCase();
        return this.getAllVideos().filter(v => {
            return (v.title && v.title.toLowerCase().includes(lower)) ||
                   (v.channel && v.channel.toLowerCase().includes(lower)) ||
                   (v.tags && v.tags.some(t => t.toLowerCase().includes(lower)));
        });
    }

    getRecommendations(videoId, limit = 10) {
        const current = this.getVideoById(videoId);
        if (!current) return this.getAllVideos().slice(0, limit);

        const currentTags = new Set((current.tags || []).map(t => t.toLowerCase()));
        const others = this.library.filter(v => v.id !== videoId);

        if (currentTags.size === 0) {
            // Sem tags, retorna videos aleatorios
            return this._shuffle(others).slice(0, limit);
        }

        // Pontuar por tags similares
        const scored = others.map(v => {
            const vTags = (v.tags || []).map(t => t.toLowerCase());
            const matches = vTags.filter(t => currentTags.has(t)).length;
            return { video: v, score: matches };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.video).slice(0, limit);
    }

    _shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Escaneia o diretorio de downloads para encontrar videos que
     * existem no disco mas nao estao registrados no library.json.
     * Isso permite importar videos baixados antes do Model existir.
     */
    scanDownloadsDir(downloadsDir) {
        if (!fs.existsSync(downloadsDir)) return;

        const registeredPaths = new Set(this.library.map(v => v.filePath));
        let added = 0;

        try {
            const entries = fs.readdirSync(downloadsDir, { withFileTypes: true });

            for (const entry of entries) {
                // Ignorar pasta .data e arquivos soltos
                if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

                const folderPath = path.join(downloadsDir, entry.name);
                const files = fs.readdirSync(folderPath);

                // Procurar por .mp4
                const mp4File = files.find(f => f.endsWith('.mp4') && !f.includes('_video') && !f.includes('_audio'));
                if (!mp4File) continue;

                const fullPath = path.join(folderPath, mp4File);

                // Ja registrado?
                if (registeredPaths.has(fullPath)) continue;

                // Extrair titulo do nome do arquivo
                const title = mp4File.replace('.mp4', '');
                const hasThumbnail = files.includes('thumbnail.jpg');
                const stat = fs.statSync(fullPath);

                const video = {
                    id: this.sanitizeFileName(title).replace(/\s+/g, '_').substring(0, 40),
                    title: title,
                    channel: 'Desconhecido',
                    description: '',
                    duration: 0,
                    filePath: fullPath,
                    folderName: entry.name,
                    thumbnailRelative: hasThumbnail ? path.join(entry.name, 'thumbnail.jpg') : '',
                    downloadDate: stat.mtime.toISOString(),
                    url: '',
                    tags: [],
                    views: 0
                };

                this.addVideo(video);
                added++;
                console.log(`[VideoModel] Video importado: ${title}`);
            }
        } catch (err) {
            console.error('Erro ao escanear diretorio de downloads:', err.message);
        }

        if (added > 0) {
            console.log(`[VideoModel] ${added} video(s) importado(s) do disco.`);
        }
    }
}

module.exports = VideoModel;

