# Contexto Atual - goTube

**Última Atualização:** 30 de Julho de 2026  
**Versão:** 1.0  
**Status do Projeto:** Em Produção / Manutenção Ativa

---

## Estado Atual do Projeto

### ✅ O Que Está Funcionando

#### Core Features
- ✅ Download de vídeos do YouTube (qualidades: 144p-1080p)
- ✅ Sistema anti-bot implementado (po_token/visitor_data)
- ✅ Player de vídeo HTML5 integrado
- ✅ Feed de vídeos estilo YouTube
- ✅ Sistema de busca (título, canal, tags)
- ✅ Recomendações baseadas em tags
- ✅ Histórico de visualizações
- ✅ Like/Dislike local
- ✅ Edição de metadados (título, descrição, avatar)
- ✅ Deletar vídeos
- ✅ Filtros por categoria (top 8 tags)

#### UI/UX
- ✅ Design dark theme inspirado no YouTube
- ✅ Sidebar colapsável
- ✅ Empty state quando biblioteca vazia
- ✅ Progress bar de download
- ✅ Modais de download e edição
- ✅ Interface responsiva

#### Persistência
- ✅ Auto-scan de vídeos existentes
- ✅ Banco JSON (library.json)
- ✅ Thumbnails salvos localmente
- ✅ Avatares customizados de canais

---

## Últimas Mudanças Realizadas

### 12/11/2026 - Atualização Pytubefix 11.x e Multi-client Fallback
**Problema:** YouTube bloqueando downloads de clientes padrão com erro `This request was detected as a bot (BotDetection)`.
**Solução Implementada:**
- Atualização do `pytubefix` para versão 11.2.1+
- Adicionado sistema de fallback sequencial de múltiplos clientes InnerTube (`None`, `WEB`, `MWEB`, `VISION_OS`, `ANDROID_VR`) em `criar_instancia_youtube()` dentro de `baixar_youtube.py`.
- Criação de documentação de resolução de problemas em `docs/TROUBLESHOOTING.md`.
- Adição de atalhos rápidos de atualização: script executável `atualizar_downloader.bat` e comando npm `npm run fix-download`.

**Arquivos Modificados:**
- `app/scripts/baixar_youtube.py`
- `package.json`
- `atualizar_downloader.bat`
- `docs/TROUBLESHOOTING.md`

---

### 30/07/2026 - Fix Bot Detection
**Problema:** YouTube bloqueando downloads com erro "This request was detected as a bot"

**Solução Implementada:**
- Adicionada função obter_tokens() em baixar_youtube.py:94-101
- Integração com innertube para obter po_token e isitor_data
- YouTube() agora recebe tokens de autenticação
- Fallback gracioso se tokens não disponíveis

**Arquivos Modificados:**
- pp/scripts/baixar_youtube.py:1-118
  - Import de innertube
  - Função obter_tokens()
  - Atualizada criarpastavideo()
  - Renomeado on_progress → custom_progress

**Impacto:** Downloads funcionando novamente sem detecção de bot

---

## Problemas Conhecidos

### 🔴 Críticos
Nenhum problema crítico conhecido no momento.

### 🟡 Médios

#### 1. Dependência do Python no Sistema
**Descrição:** Aplicação requer Python instalado no PATH do usuário  
**Impacto:** Usuários sem Python não conseguem usar  
**Workaround:** Documentação clara no README  
**Solução Futura:** Bundlar Python com a aplicação

#### 2. Apenas Windows Suportado
**Descrição:** FFmpeg bundled é apenas para Windows  
**Impacto:** Não funciona em Linux/macOS  
**Workaround:** N/A  
**Solução Futura:** Builds específicos por plataforma

#### 3. pytubefix Pode Quebrar
**Descrição:** YouTube muda APIs frequentemente  
**Impacto:** Downloads podem parar de funcionar  
**Workaround:** Atualizar pytubefix regularmente  
**Solução Futura:** Implementar fallback para yt-dlp

### 🟢 Baixos

#### 1. Sem Validação de Integridade
**Descrição:** Arquivos MP4 não são validados após download  
**Impacto:** Vídeos corrompidos podem não ser detectados  
**Solução Futura:** Checksum ou reprodução de teste

#### 2. Likes e Avatar do Canal Imprecisos
**Descrição:** API do YouTube não fornece dados exatos via pytubefix  
**Impacto:** Contadores podem estar desatualizados  
**Solução Futura:** Integração com YouTube Data API v3

---

## Configuração do Ambiente

### Requisitos do Sistema

**Hardware Mínimo:**
- CPU: Dual-core 2.0GHz+
- RAM: 4GB
- Disco: 2GB + espaço para vídeos
- GPU: Suporte a aceleração de vídeo recomendado

**Software:**
- Windows 10/11 (64-bit)
- Python 3.8+ no PATH
- Internet (apenas para downloads)

### Dependências

**Node.js (package.json):**
`json
{
  "devDependencies": {
    "electron": "^42.0.1",
    "electron-builder": "^26.8.1"
  }
}
`

**Python (não declarado formalmente):**
`
pytubefix  # Instalar com: pip install pytubefix
`

**Bundled:**
- FFmpeg.exe (incluído em app/scripts/)

### Instalação para Desenvolvimento

`ash
# 1. Clonar repositório
git clone [repo-url]
cd "Youtube Go2"

# 2. Instalar dependências Node
npm install

# 3. Instalar dependências Python
pip install pytubefix

# 4. Executar em desenvolvimento
npm start

# 5. Build para produção
npm run build
`

---

## Estrutura de Dados

### Metadados de Vídeo (library.json)

`json
{
  "xfnuV0IYiII": {
    "id": "xfnuV0IYiII",
    "title": "Título do Vídeo",
    "channel": "Nome do Canal",
    "description": "Descrição...",
    "duration": 300,
    "filePath": "C:\\Users\\AMD\\Videos\\goTube\\Video - Título\\Título.mp4",
    "folderName": "Video - Título",
    "thumbnailRelative": "Video - Título/thumbnail.jpg",
    "channelAvatarRelative": "Video - Título/channel_avatar.jpg",
    "downloadDate": "2026-07-30T20:33:00.000Z",
    "url": "https://youtube.com/watch?v=xfnuV0IYiII",
    "tags": ["tag1", "tag2", "tag3"],
    "views": 123456,
    "originalLikes": 5000,
    "userInteraction": "like",
    "lastWatched": "2026-07-30T20:45:00.000Z"
  }
}
`

### Diretórios

**Base:** C:\Users\AMD\Videos\goTube\

**Estrutura:**
`
goTube/
├── .data/
│   └── library.json
├── Video - Título 1/
│   ├── Título 1.mp4
│   ├── thumbnail.jpg
│   └── channel_avatar.jpg (opcional)
└── Video - Título 2/
    ├── Título 2.mp4
    └── thumbnail.jpg
`

---

## Comandos Úteis

### Desenvolvimento
`ash
npm start                    # Executar em dev mode
npm run build               # Build para Windows
`

### Debugging
`ash
# Ver logs do Electron (abrir DevTools no app)
Ctrl+Shift+I

# Ver output do Python
# Logs são capturados via stdout/stderr no DownloadController
`

### Manutenção
`ash
# Limpar build anterior
Remove-Item -Recurse -Force dist/

# Reinstalar dependências
Remove-Item -Recurse -Force node_modules/
npm install

# Atualizar pytubefix
pip install --upgrade pytubefix
`

---

## Guia de Troubleshooting

### Problema: "This request was detected as a bot"
**Causa:** YouTube bloqueando pytubefix  
**Solução:**
1. Verificar se fix mais recente está aplicado (obter_tokens())
2. Atualizar pytubefix: pip install --upgrade pytubefix
3. Verificar se innertube está importando corretamente

### Problema: "Python não encontrado"
**Causa:** Python não está no PATH  
**Solução:**
1. Instalar Python 3.8+ de python.org
2. Marcar "Add Python to PATH" durante instalação
3. Reiniciar terminal/aplicação

### Problema: Download falha no FFmpeg
**Causa:** FFmpeg.exe não encontrado ou corrompido  
**Solução:**
1. Verificar se pp/scripts/ffmpeg.exe existe
2. Redownload FFmpeg se necessário
3. Verificar permissões de execução

### Problema: Vídeo não reproduz
**Causa:** Arquivo corrompido ou codec não suportado  
**Solução:**
1. Deletar vídeo e baixar novamente
2. Verificar se arquivo MP4 existe no disco
3. Testar reprodução em player externo (VLC)

### Problema: Biblioteca não carrega
**Causa:** library.json corrompido  
**Solução:**
1. Verificar se C:\Users\AMD\Videos\goTube\.data\library.json existe
2. Validar JSON em jsonlint.com
3. Deletar JSON e executar auto-scan (app recria arquivo)

---

## Workflow de Contribuição

### Antes de Modificar Código

1. **Ler Documentação:**
   - PRD.md - Entender requisitos
   - ARQUITETURA.md - Entender estrutura
   - CONTEXTO.md (este arquivo) - Estado atual

2. **Verificar Problemas Conhecidos:**
   - Checar se issue já está documentada aqui

3. **Testar Localmente:**
   `ash
   npm start  # Sempre testar antes de buildar
   `

### Padrões de Código

**JavaScript:**
- Usar const/let (nunca ar)
- Camel case para variáveis
- Comentários em português
- Sanitizar inputs com funções do VideoModel

**Python:**
- UTF-8 encoding explícito
- Função por responsabilidade
- Logging via print(..., flush=True)
- Sanitizar texto com sanitizar_texto()

**CSS:**
- Variáveis CSS para cores
- Mobile-first quando possível
- BEM naming quando aplicável

---

## Roadmap de Curto Prazo

### Próximas 2 Semanas

#### Segurança (Alta Prioridade)
- [ ] Implementar contextBridge para IPC seguro
- [ ] Adicionar validação rigorosa de URLs
- [ ] Sandboxing de processos Python

#### Testes (Média Prioridade)
- [ ] Setup de Jest/Mocha
- [ ] Testes unitários para VideoModel
- [ ] Testes de integração para DownloadController
- [ ] Mocks para IPC

#### Documentação (Média Prioridade)
- [ ] Criar requirements.txt para Python
- [ ] Atualizar README com instruções completas
- [ ] Documentar API IPC

---

## Roadmap de Longo Prazo

### Q3 2026

#### Novas Funcionalidades
- [ ] Playlists customizadas
- [ ] Download em lote (múltiplas URLs)
- [ ] Retry automático para downloads falhos
- [ ] Exportar/Importar biblioteca

#### Melhorias de UX
- [ ] Atalhos de teclado no player
- [ ] Modo teatro/tela cheia
- [ ] Preview hover em thumbnails
- [ ] Notificações desktop

#### Infraestrutura
- [ ] Suporte multiplataforma (Linux, macOS)
- [ ] Migrar de JSON para SQLite
- [ ] Bundlar Python com aplicação
- [ ] CI/CD pipeline

---

## Métricas e Performance

### Benchmarks Atuais

**Download (Conexão 10Mbps):**
- Vídeo 1080p (10min): ~3-4 minutos
- Vídeo 720p (10min): ~2-3 minutos

**UI Performance:**
- Tempo de abertura: < 2s
- Busca (100 vídeos): < 50ms
- Busca (1000 vídeos): ~150ms
- Scroll no feed: 60fps

**Armazenamento:**
- Vídeo 1080p (10min): ~200-300MB
- Vídeo 720p (10min): ~100-150MB
- Thumbnail: ~100-200KB
- Metadados (100 vídeos): ~500KB

---

## Contatos e Recursos

### Repositório
- **GitHub:** [URL do repositório]
- **Issues:** [URL/issues]

### Documentação Externa
- **Electron:** https://electronjs.org/docs
- **pytubefix:** https://pytubefix.readthedocs.io
- **FFmpeg:** https://ffmpeg.org/documentation.html

### Comunidade
- **Discord:** [Link se houver]
- **Discussions:** [GitHub Discussions se houver]

---

## Changelog

### v1.0.0 - 30/07/2026
- ✅ Implementação inicial completa
- ✅ Fix bot detection com po_token
- ✅ Sistema de recomendações
- ✅ Edição de metadados
- ✅ Like/Dislike local
- ✅ Documentação completa (PRD, Arquitetura, Contexto)

---

## Notas Importantes

### Para Novos Desenvolvedores
1. **Leia primeiro:** PRD.md → ARQUITETURA.md → CONTEXTO.md
2. **Configure o ambiente** seguindo seção "Instalação para Desenvolvimento"
3. **Não commite** sem testar localmente com 
pm start
4. **Sempre sanitize** inputs antes de salvar (use funções do VideoModel)

### Para Manutenção
1. **Monitore pytubefix:** YouTube muda APIs frequentemente
2. **Atualize dependências** mensalmente: 
pm outdated + pip list --outdated
3. **Backup library.json** antes de mudanças estruturais

### Para Deploy
1. **Teste build:** 
pm run build e execute o .exe
2. **Verifique ASAR unpacking:** Scripts Python devem estar descompactados
3. **Teste em máquina limpa** sem Python instalado para validar documentação

---

**Este documento é vivo e deve ser atualizado a cada mudança significativa no projeto.**
