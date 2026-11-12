# Arquitetura - goTube

## Visão Geral da Arquitetura

goTube utiliza uma arquitetura **MVC (Model-View-Controller)** híbrida com processos Electron e Python.

## Stack Tecnológica

### Frontend
- **Electron 42.0.1** - Framework desktop
- **HTML5/CSS3** - Interface
- **Vanilla JavaScript** - Lógica do cliente
- **Material Icons** - Iconografia
- **Google Fonts (Roboto)** - Tipografia

### Backend
- **Node.js** - Runtime principal
- **Python 3.x** - Engine de downloads
- **pytubefix** - Cliente YouTube
- **FFmpeg** - Processamento de vídeo

### Storage
- **File System** - Armazenamento de vídeos
- **JSON** - Banco de dados local (library.json)

## Estrutura de Diretórios

```
Youtube Go2/
├── app/
│   ├── controllers/
│   │   └── DownloadController.js
│   ├── models/
│   │   └── VideoModel.js
│   ├── views/
│   │   ├── index.html
│   │   ├── styles/main.css
│   │   └── scripts/renderer.js
│   ├── scripts/
│   │   ├── baixar_youtube.py
│   │   └── ffmpeg.exe
│   └── assets/
│       └── icon.png
├── docs/
│   ├── PRD.md
│   ├── ARQUITETURA.md
│   └── CONTEXTO.md
├── dist/
├── main.js
└── package.json
```

## Componentes Principais

### 1. main.js (Electron Main Process)
**Responsabilidades:**
- Criar janela principal
- Gerenciar ciclo de vida
- Inicializar VideoModel
- Configurar DownloadController

### 2. VideoModel.js (Data Layer)
**Responsabilidades:**
- CRUD de vídeos
- Busca e filtros
- Sistema de recomendações
- Persistência em JSON

### 3. DownloadController.js (Business Logic)
**Responsabilidades:**
- Orquestrar downloads
- Comunicação IPC
- Gerenciar processos Python

### 4. baixar_youtube.py (Download Engine)
**Responsabilidades:**
- Autenticação YouTube
- Download de streams
- Combinação vídeo+áudio
- Extração de metadados

### 5. renderer.js (UI Logic)
**Responsabilidades:**
- Renderização de componentes
- Navegação
- Eventos de usuário
- Comunicação IPC

### 6. index.html + main.css (View Layer)
**Responsabilidades:**
- Layout e estrutura
- Design system
- Responsividade

## Fluxo de Dados

### Download de Vídeo
```
[UI] → IPC → [Controller] → spawn → [Python] → YouTube API
                                       ↓
                                   FFmpeg combine
                                       ↓
                                   File System
                                       ↓
                [Model] ← metadata ← stdout
                   ↓
              library.json
                   ↓
              IPC → [UI]
```

### Reprodução de Vídeo
```
[UI Click] → IPC → [Model] → get video metadata
                                    ↓
                              file:// URL
                                    ↓
                            HTML5 Video Player
                                    ↓
                        mark as watched → [Model]
```

## Comunicação IPC

### Canais Implementados
- **start-download** - Iniciar download
- **get-all-videos** - Listar biblioteca
- **search-videos** - Buscar vídeos
- **get-recommendations** - Vídeos relacionados
- **update-video** - Editar metadados
- **delete-video** - Remover vídeo
- **mark-as-watched** - Registrar visualização
- **set-interaction** - Like/Dislike
- **pick-channel-avatar** - Selecionar avatar

## Persistência

### library.json
**Localização:** ~/Videos/goTube/.data/library.json

**Estrutura:**
```json
{
  "videoId1": { metadata },
  "videoId2": { metadata }
}
```

### Diretórios de Vídeos
**Localização:** ~/Videos/goTube/

**Estrutura:**
```
Video - Title/
├── Title.mp4
├── thumbnail.jpg
└── channel_avatar.jpg
```

## Segurança

### Vulnerabilidades Conhecidas
- nodeIntegration: true
- contextIsolation: false
- Spawn Python sem validação rigorosa

### Mitigações Implementadas
- Sanitização de nomes de arquivo
- UTF-8 forçado
- Validação de paths

### Melhorias Futuras
- Implementar contextBridge
- Validação de URLs
- Sandboxing de processos

## Performance

### Otimizações
- Lazy loading de vídeos
- Cache de thumbnails
- Busca em memória

### Métricas
- Tempo de busca: <200ms (1000 vídeos)
- Tempo de abertura player: <1s
- UI: 60fps em scroll

## Build e Deploy

### electron-builder
```json
{
  "appId": "com.gotube.app",
  "win": { "target": "portable" },
  "asar": true,
  "asarUnpack": ["app/scripts/**/*"]
}
```

### Processo de Build
1. npm run build
2. electron-builder empacota app
3. ASAR compacta arquivos
4. Scripts Python permanecem descompactados
5. Output: dist/win-unpacked/goTube.exe

## Dependências Críticas

### Node.js
- electron: ^42.0.1
- electron-builder: ^26.8.1

### Python
- pytubefix
- subprocess (stdlib)
- urllib (stdlib)

### Sistema
- Python 3.8+ no PATH
- FFmpeg (bundled)

## Escalabilidade

### Limitações Atuais
- Busca linear O(n)
- JSON carregado em memória
- Single-threaded downloads

### Melhorias Futuras
- Indexação de busca
- SQLite para metadados
- Download queue com workers

## Testes

### Status Atual
- Sem suite de testes

### Recomendações
- Unit tests: Jest/Mocha
- E2E: Spectron
- Mocks para IPC e Python spawn

## Documentação Técnica

### Referências
- Electron Docs: https://electronjs.org
- pytubefix: https://pytubefix.readthedocs.io
- FFmpeg: https://ffmpeg.org/documentation.html
