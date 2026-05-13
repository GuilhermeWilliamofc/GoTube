# GoTube

O **GoTube** é um player de vídeos local focado em oferecer uma experiência idêntica à do YouTube, mas funcionando totalmente offline. Todo o conteúdo é consumido de uma biblioteca local (vídeos previamente baixados), e o aplicativo constrói automaticamente um feed, páginas de vídeo e um sistema de recomendações baseado nos metadados desses vídeos.

## Principais Funcionalidades

- **Experiência Offline Premium:** Navegue por vídeos baixados com uma interface fluida, estilo YouTube.
- **Feed Automático:** Os vídeos baixados aparecem automaticamente no feed do aplicativo.
- **Player Dedicado:** Página de vídeo com título, descrição, informações de download e player integrado.
- **Recomendações Locais:** Sistema de sugestões baseado em tags (sem necessidade de internet).
- **Download Integrado:** Interface gráfica que se conecta a um script Python para baixar novos vídeos, priorizando áudio em máxima qualidade.

## Stack Tecnológica

- **Frontend / Core:** Electron.js (HTML, CSS nativo para performance e beleza, Vanilla JS).
- **Arquitetura:** Padrão MVC para clara separação de responsabilidades.
- **Armazenamento:** Sistema local para arquivos `.mp4` e `.json` para persistência dos metadados.
- **Integração:** `child_process` do Node.js para chamar scripts em Python (Downloader).

## Instalação e Execução (em breve)

Detalhes sobre como rodar o aplicativo e configurar o script Python serão adicionados conforme a implementação avança.
