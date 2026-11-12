const { ipcRenderer } = require('electron');
const path = require('path');

let downloadsDir = '';
let currentPage = 'home';
let allVideos = [];

// ===== UTILIDADES =====

function sanitizeForDisplay(text) {
    if (!text) return '';
    // Remove caracteres de controle mas mantém acentuação
    return text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').trim();
}

function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRelativeDate(isoDate) {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Baixado ha ${diffMins} min`;
        if (diffHours < 24) return `Baixado ha ${diffHours}h`;
        if (diffDays === 1) return 'Baixado ontem';
        if (diffDays < 30) return `Baixado ha ${diffDays} dias`;
        return `Baixado em ${date.toLocaleDateString('pt-BR')}`;
    } catch {
        return '';
    }
}

function getThumbnailPath(video) {
    if (!video.thumbnailRelative || !downloadsDir) return '';
    const fullPath = path.join(downloadsDir, video.thumbnailRelative);
    // Converter para file:// URL para o Electron
    return `file:///${fullPath.replace(/\\/g, '/')}`;
}

function getChannelAvatarPath(video) {
    if (!video.channelAvatarRelative || !downloadsDir) return '';
    const fullPath = path.join(downloadsDir, video.channelAvatarRelative);
    return `file:///${fullPath.replace(/\\/g, '/')}`;
}

// ===== CRIACAO DE CARDS =====

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.videoId = video.id;

    const thumbUrl = getThumbnailPath(video);
    const thumbContent = thumbUrl
        ? `<img src="${thumbUrl}" alt="${sanitizeForDisplay(video.title)}" loading="lazy">`
        : `<div class="thumb-placeholder"><i class="material-icons">movie</i></div>`;

    card.innerHTML = `
        <div class="thumbnail">
            ${thumbContent}
            <span class="duration">${formatDuration(video.duration)}</span>
        </div>
        <div class="video-info">
            ${getChannelAvatarPath(video) 
                ? `<img class="channel-avatar-small" src="${getChannelAvatarPath(video)}" alt="Avatar">` 
                : `<div class="channel-avatar-small">${(video.channel || 'D')[0].toUpperCase()}</div>`}
            <div class="video-details">
                <h3>${sanitizeForDisplay(video.title)}</h3>
                <p class="channel-name">${sanitizeForDisplay(video.channel)}</p>
                <p class="views-time">${formatRelativeDate(video.downloadDate)}</p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => openPlayer(video.id));
    return card;
}

function createRecommendationCard(video) {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.dataset.videoId = video.id;

    const thumbUrl = getThumbnailPath(video);
    const thumbContent = thumbUrl
        ? `<img src="${thumbUrl}" alt="${sanitizeForDisplay(video.title)}" loading="lazy">`
        : `<div class="thumb-placeholder small"><i class="material-icons">movie</i></div>`;

    card.innerHTML = `
        <div class="rec-thumbnail">
            ${thumbContent}
            <span class="duration small">${formatDuration(video.duration)}</span>
        </div>
        <div class="rec-info">
            <h4>${sanitizeForDisplay(video.title)}</h4>
            <p>${sanitizeForDisplay(video.channel)}</p>
            <p class="rec-date">${formatRelativeDate(video.downloadDate)}</p>
        </div>
    `;

    card.addEventListener('click', () => openPlayer(video.id));
    return card;
}

// ===== RENDERIZACAO DO FEED =====

function renderFeed(videos) {
    const container = document.getElementById('feed-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (!videos || videos.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        document.getElementById('categories-bar').style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    container.style.display = 'grid';
    document.getElementById('categories-bar').style.display = 'flex';

    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });

    // Atualizar categorias dinamicas
    updateCategories(videos);
}

function updateCategories(videos) {
    const bar = document.getElementById('categories-bar');
    const allTags = new Set();
    
    videos.forEach(v => {
        if (v.tags) v.tags.forEach(t => allTags.add(t));
    });

    bar.innerHTML = '<button class="category active" data-tag="all">Tudo</button>';
    
    // Mostrar ate 8 tags mais comuns
    const tagCount = {};
    videos.forEach(v => {
        if (v.tags) v.tags.forEach(t => {
            tagCount[t] = (tagCount[t] || 0) + 1;
        });
    });

    const topTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag]) => tag);

    topTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'category';
        btn.dataset.tag = tag;
        btn.textContent = sanitizeForDisplay(tag);
        bar.appendChild(btn);
    });

    // Adicionar listeners de categoria
    bar.querySelectorAll('.category').forEach(btn => {
        btn.addEventListener('click', () => {
            bar.querySelectorAll('.category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedTag = btn.dataset.tag;
            if (selectedTag === 'all') {
                renderFeedCards(allVideos);
            } else {
                const filtered = allVideos.filter(v => 
                    v.tags && v.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
                );
                renderFeedCards(filtered.length > 0 ? filtered : allVideos);
            }
        });
    });
}

function renderFeedCards(videos) {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
}

let currentVideoId = null;
let currentFeedMode = 'home'; // 'home' ou 'history'

// ===== PLAYER =====

function openPlayer(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return;

    currentVideoId = videoId;

    // Trocar pagina
    showPage('player');

    const player = document.getElementById('video-player');
    const filePath = video.filePath;

    // Converter caminho local para file:// URL
    player.src = `file:///${filePath.replace(/\\/g, '/')}`;
    
    document.getElementById('player-title').textContent = sanitizeForDisplay(video.title);
    document.getElementById('player-channel').textContent = sanitizeForDisplay(video.channel);
    
    const avatarContainer = document.getElementById('player-channel-avatar');
    const avatarUrl = getChannelAvatarPath(video);
    if (avatarUrl) {
        avatarContainer.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        avatarContainer.textContent = (sanitizeForDisplay(video.channel) || 'D')[0].toUpperCase();
    }

    document.getElementById('player-date').textContent = formatRelativeDate(video.downloadDate);
    document.getElementById('player-description').textContent = sanitizeForDisplay(video.description) || 'Sem descricao disponivel.';

    // Atualizar UI de Likes/Dislikes
    updateInteractionUI(video);

    // Marcar como assistido no Histórico
    ipcRenderer.send('mark-as-watched', videoId);

    // Carregar recomendacoes
    ipcRenderer.send('get-recommendations', videoId);
}

function updateInteractionUI(video) {
    const likeIcon = document.getElementById('like-icon');
    const dislikeIcon = document.getElementById('dislike-icon');
    const likeCount = document.getElementById('like-count');

    let totalLikes = video.originalLikes || 0;
    if (video.userInteraction === 'like') totalLikes += 1;

    // Formatador simples para likes (ex: 1.2K)
    let formattedLikes = totalLikes;
    if (totalLikes >= 1000000) formattedLikes = (totalLikes / 1000000).toFixed(1) + 'M';
    else if (totalLikes >= 1000) formattedLikes = (totalLikes / 1000).toFixed(1) + 'K';

    likeCount.textContent = formattedLikes;

    likeIcon.textContent = video.userInteraction === 'like' ? 'thumb_up' : 'thumb_up_off_alt';
    dislikeIcon.textContent = video.userInteraction === 'dislike' ? 'thumb_down' : 'thumb_down_off_alt';

    document.getElementById('like-btn').classList.toggle('active', video.userInteraction === 'like');
    document.getElementById('dislike-btn').classList.toggle('active', video.userInteraction === 'dislike');
}

// ===== NAVEGACAO =====

function showPage(page) {
    currentPage = page;
    document.getElementById('page-home').style.display = page === 'home' ? 'block' : 'none';
    document.getElementById('page-player').style.display = page === 'player' ? 'block' : 'none';

    // Atualizar sidebar active
    document.querySelectorAll('.nav-links li').forEach(li => {
        const liPage = li.dataset.page;
        if (page === 'player') {
            li.classList.toggle('active', liPage === 'home');
        } else {
            li.classList.toggle('active', liPage === currentFeedMode);
        }
    });

    // Se voltou ao home, parar o video
    if (page === 'home') {
        const player = document.getElementById('video-player');
        player.pause();
        player.src = '';
    }
}

// ===== INICIALIZACAO =====

document.addEventListener('DOMContentLoaded', () => {
    // Solicitar diretorio de downloads
    ipcRenderer.send('get-downloads-dir');

    // ---- SIDEBAR ----

    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', () => {
            const page = li.dataset.page;
            if (page === 'home') {
                currentFeedMode = 'home';
                showPage('home');
                ipcRenderer.send('get-all-videos');
            } else if (page === 'history') {
                currentFeedMode = 'history';
                showPage('home');
                ipcRenderer.send('get-all-videos');
            }
        });
    });

    // ---- LOGO -> HOME ----
    document.getElementById('logo-home').addEventListener('click', () => {
        currentFeedMode = 'home';
        showPage('home');
        ipcRenderer.send('get-all-videos');
    });

    // ---- MENU TOGGLE ----
    document.getElementById('menu-toggle-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // ---- BUSCA ----
    const searchInput = document.getElementById('search-input');
    document.getElementById('search-btn').addEventListener('click', () => {
        const q = searchInput.value.trim();
        currentFeedMode = 'home';
        if (q) {
            showPage('home');
            ipcRenderer.send('search-videos', q);
        } else {
            ipcRenderer.send('get-all-videos');
        }
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = searchInput.value.trim();
            currentFeedMode = 'home';
            showPage('home');
            if (q) {
                ipcRenderer.send('search-videos', q);
            } else {
                ipcRenderer.send('get-all-videos');
            }
        }
    });

    // ---- MODAL DOWNLOAD ----
    const modal = document.getElementById('download-modal');
    const urlInput = document.getElementById('youtube-url');
    const qualitySelect = document.getElementById('download-quality');
    const startBtn = document.getElementById('start-download-btn');
    const statusText = document.getElementById('download-status');
    const progressArea = document.getElementById('download-progress-area');
    const progressBar = document.getElementById('download-progress-bar');

    document.getElementById('download-btn').addEventListener('click', () => {
        modal.style.display = 'flex';
        statusText.textContent = '';
        progressArea.style.display = 'none';
        progressBar.style.width = '0%';
    });

    // Empty state download button
    const emptyDownloadBtn = document.getElementById('empty-download-btn');
    if (emptyDownloadBtn) {
        emptyDownloadBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    document.getElementById('modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    startBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        const qualidade = qualitySelect.value;
        if (!url) {
            statusText.textContent = 'Por favor, insira uma URL valida.';
            progressArea.style.display = 'block';
            return;
        }
        statusText.textContent = 'Iniciando download...';
        progressArea.style.display = 'block';
        progressBar.style.width = '0%';
        startBtn.disabled = true;
        startBtn.textContent = 'Baixando...';
        ipcRenderer.send('start-download', { url, qualidade });
    });

    // ---- MODAL EDICAO ----
    const editModal = document.getElementById('edit-modal');
    const editTitleInput = document.getElementById('edit-title');
    const editDescInput = document.getElementById('edit-description');

    document.getElementById('edit-video-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        const video = allVideos.find(v => v.id === currentVideoId);
        if (video) {
            editTitleInput.value = sanitizeForDisplay(video.title) || '';
            editDescInput.value = sanitizeForDisplay(video.description) || '';
            document.getElementById('avatar-status').textContent = video.channelAvatarRelative ? "Já possui ícone" : "Opcional";
            document.getElementById('avatar-status').style.color = "var(--text-secondary)";
            editModal.style.display = 'flex';
        }
    });

    document.getElementById('edit-modal-close').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    document.getElementById('save-edit-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        const updates = {
            title: editTitleInput.value.trim(),
            description: editDescInput.value.trim()
        };
        ipcRenderer.send('update-video', { videoId: currentVideoId, updates });
        editModal.style.display = 'none';
    });

    document.getElementById('change-avatar-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        ipcRenderer.send('pick-channel-avatar', currentVideoId);
    });

    ipcRenderer.on('avatar-picked', (event, response) => {
        const status = document.getElementById('avatar-status');
        if (response.success) {
            if (response.channel && response.message) {
                status.textContent = response.message;
            } else {
                status.textContent = "Ícone selecionado!";
            }
            status.style.color = "#4caf50";
        } else {
            status.textContent = "Erro ao selecionar";
            status.style.color = "#f44336";
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.style.display = 'none';
    });

    // ---- DELETAR ----
    document.getElementById('delete-video-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        if (confirm("Tem certeza que deseja deletar este video? Esta acao excluira os arquivos do disco irreversivelmente.")) {
            // Parar o player e limpar o src para liberar o arquivo no Windows
            const player = document.getElementById('video-player');
            player.pause();
            player.removeAttribute('src');
            player.load();
            
            // Pequeno delay para garantir que o SO liberou o lock do arquivo
            setTimeout(() => {
                ipcRenderer.send('delete-video', currentVideoId);
            }, 100);
        }
    });

    // ---- LIKES / DISLIKES ----
    document.getElementById('like-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        const video = allVideos.find(v => v.id === currentVideoId);
        if (video) {
            const newInteraction = video.userInteraction === 'like' ? null : 'like';
            ipcRenderer.send('set-interaction', { videoId: currentVideoId, interaction: newInteraction });
        }
    });

    document.getElementById('dislike-btn').addEventListener('click', () => {
        if (!currentVideoId) return;
        const video = allVideos.find(v => v.id === currentVideoId);
        if (video) {
            const newInteraction = video.userInteraction === 'dislike' ? null : 'dislike';
            ipcRenderer.send('set-interaction', { videoId: currentVideoId, interaction: newInteraction });
        }
    });

    // ---- IPC RESPONSES ----
    
    ipcRenderer.on('downloads-dir', (event, dir) => {
        downloadsDir = dir;
        // Agora que temos o dir, carregar videos
        ipcRenderer.send('get-all-videos');
    });

    ipcRenderer.on('all-videos', (event, videos) => {
        allVideos = videos || [];
        if (currentPage === 'home') {
            if (currentFeedMode === 'history') {
                // Filtrar e ordenar por historico
                const historyVideos = allVideos
                    .filter(v => v.lastWatched)
                    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
                
                // Mudar titulo e esconder barra de categorias temporariamente
                document.getElementById('categories-bar').style.display = 'none';
                renderFeedCards(historyVideos);
                
                if (historyVideos.length === 0) {
                    const container = document.getElementById('feed-container');
                    container.style.display = 'none';
                    const emptyState = document.getElementById('empty-state');
                    emptyState.style.display = 'flex';
                    emptyState.querySelector('h2').textContent = 'Nenhum histórico encontrado';
                    emptyState.querySelector('p').textContent = 'Você ainda não assistiu a nenhum vídeo baixado.';
                } else {
                    document.getElementById('empty-state').style.display = 'none';
                    document.getElementById('feed-container').style.display = 'grid';
                }
            } else {
                // Modo Home (Tudo)
                document.getElementById('empty-state').querySelector('h2').textContent = 'Sua biblioteca esta vazia';
                document.getElementById('empty-state').querySelector('p').textContent = 'Comece a baixar videos usando o botao acima para construir sua biblioteca de midia offline.';
                renderFeed(allVideos);
            }
        }
        
        // Se estivermos vendo o player atual, atualizamos as interactions
        if (currentPage === 'player' && currentVideoId) {
            const updatedVideo = allVideos.find(v => v.id === currentVideoId);
            if (updatedVideo) updateInteractionUI(updatedVideo);
        }
    });

    ipcRenderer.on('search-results', (event, videos) => {
        allVideos = videos || [];
        renderFeed(allVideos);
    });

    ipcRenderer.on('recommendations', (event, recs) => {
        const list = document.getElementById('recommendations-list');
        list.innerHTML = '';
        if (recs && recs.length > 0) {
            recs.forEach(v => list.appendChild(createRecommendationCard(v)));
        } else {
            list.innerHTML = '<p class="no-recs">Sem recomendacoes disponiveis.</p>';
        }
    });

    ipcRenderer.on('download-progress', (event, { progress }) => {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        statusText.textContent = `Baixando... ${progress.toFixed(1)}%`;
    });

    ipcRenderer.on('download-status', (event, { status }) => {
        statusText.textContent = status;
    });

    ipcRenderer.on('download-info', (event, { title }) => {
        statusText.textContent = `Baixando: ${sanitizeForDisplay(title)}`;
    });

    ipcRenderer.on('download-quality', (event, { quality }) => {
        statusText.textContent = `Qualidade selecionada: ${quality}`;
    });

    ipcRenderer.on('download-complete', (event, { filePath, video }) => {
        statusText.textContent = 'Download concluido!';
        progressBar.style.width = '100%';
        urlInput.value = '';
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="material-icons" style="vertical-align: middle; margin-right:4px; font-size:18px;">download</i> Iniciar Download';

        // Atualizar feed imediatamente
        ipcRenderer.send('get-all-videos');

        // Fechar modal apos 2 segundos
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    });

    ipcRenderer.on('download-error', (event, { error }) => {
        statusText.textContent = `Erro: ${sanitizeForDisplay(error)}`;
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="material-icons" style="vertical-align: middle; margin-right:4px; font-size:18px;">download</i> Iniciar Download';
    });

    ipcRenderer.on('video-updated', (event, result) => {
        if (result.success && result.video) {
            // Atualizar UI do player se estivermos vendo este video
            if (currentVideoId === result.video.id) {
                document.getElementById('player-title').textContent = sanitizeForDisplay(result.video.title);
                document.getElementById('player-description').textContent = sanitizeForDisplay(result.video.description) || 'Sem descricao disponivel.';
            }
        } else {
            alert(result.error || 'Erro ao atualizar vídeo');
        }
    });

    ipcRenderer.on('video-deleted', (event, result) => {
        if (result.success) {
            if (currentVideoId === result.videoId) {
                showPage('home');
                currentVideoId = null;
            }
        } else {
            alert(result.error || 'Erro ao deletar vídeo');
        }
    });
});
