# PRD - Product Requirements Document

## goTube - Player de Vídeos Offline do YouTube

**Versão:** 1.0  
**Data:** 30 de Julho de 2026  
**Status:** Ativo

---

## 1. Visão do Produto

### 1.1 Resumo Executivo
goTube é uma aplicação desktop que permite aos usuários baixar vídeos do YouTube e organizá-los em uma biblioteca offline pessoal, oferecendo uma experiência de navegação e reprodução similar à plataforma YouTube, mas completamente local.

### 1.2 Problema
- Dependência de conexão com internet para assistir vídeos favoritos
- Risco de vídeos serem removidos ou ficarem indisponíveis
- Impossibilidade de organizar biblioteca pessoal de vídeos do YouTube
- Preocupações com privacidade ao assistir conteúdo online

### 1.3 Solução
Uma aplicação desktop que:
- Baixa vídeos do YouTube em alta qualidade
- Organiza vídeos em biblioteca local pesquisável
- Oferece interface familiar inspirada no YouTube
- Funciona completamente offline após o download
- Permite personalização de metadados

### 1.4 Público-Alvo
- Criadores de conteúdo que precisam de referências offline
- Usuários com conexão de internet instável
- Pessoas que desejam preservar vídeos importantes
- Usuários preocupados com privacidade
- Estudantes que assistem vídeos educacionais repetidamente

---

## 2. Objetivos do Produto

### 2.1 Objetivos de Negócio
- Criar uma biblioteca offline pessoal de vídeos
- Oferecer alternativa offline à experiência YouTube
- Garantir preservação de conteúdo importante

### 2.2 Métricas de Sucesso
- Vídeos baixados com sucesso (taxa de conclusão > 95%)
- Tempo médio de download por vídeo
- Número de vídeos na biblioteca por usuário
- Taxa de uso do sistema de busca e recomendações

---

## 3. Funcionalidades

### 3.1 Core Features (Implementadas)

#### F1: Download de Vídeos
**Prioridade:** P0  
**Status:** ✅ Implementado

**Descrição:**
- Usuário insere URL do YouTube
- Seleciona qualidade desejada (144p, 360p, 480p, 720p, 1080p)
- Sistema baixa vídeo e áudio separadamente
- Combina em arquivo MP4 final com FFmpeg
- Fallback automático se qualidade não disponível

**Critérios de Aceitação:**
- [x] Suporta URLs do YouTube (youtube.com, youtu.be)
- [x] Permite seleção de qualidade
- [x] Exibe progresso em tempo real
- [x] Baixa thumbnail automaticamente
- [x] Áudio sempre na melhor qualidade disponível
- [x] Tratamento de erros com feedback claro
- [x] Autenticação anti-bot (po_token/visitor_data)

**Limitações:**
- Apenas Windows (FFmpeg.exe bundled)
- Requer Python no sistema

---

#### F2: Biblioteca de Vídeos
**Prioridade:** P0  
**Status:** ✅ Implementado

**Descrição:**
Feed principal exibindo todos os vídeos baixados em grid responsivo.

**Critérios de Aceitação:**
- [x] Exibe thumbnail, título, canal, duração
- [x] Grid responsivo (mínimo 300px por card)
- [x] Ordenação por data de download (mais recente primeiro)
- [x] Empty state quando biblioteca vazia
- [x] Auto-scan de vídeos existentes no disco

---

#### F3: Player de Vídeo
**Prioridade:** P0  
**Status:** ✅ Implementado

**Descrição:**
Player integrado com controles nativos e sidebar de recomendações.

**Critérios de Aceitação:**
- [x] Player HTML5 com controles nativos
- [x] Aspect ratio 16:9 preservado
- [x] Exibe título, canal, descrição
- [x] Sidebar com 10 vídeos recomendados
- [x] Botões Like/Dislike funcionais
- [x] Marca vídeo como assistido automaticamente
- [x] Botões Editar e Deletar visíveis

---

#### F4: Sistema de Busca
**Prioridade:** P1  
**Status:** ✅ Implementado

**Descrição:**
Busca textual em tempo real na biblioteca.

**Critérios de Aceitação:**
- [x] Busca por título, canal, tags
- [x] Case-insensitive
- [x] Executa com Enter ou botão
- [x] Exibe resultados em grid
- [x] Feedback quando sem resultados

---

#### F5: Sistema de Recomendações
**Prioridade:** P1  
**Status:** ✅ Implementado

**Descrição:**
Algoritmo baseado em tags para sugerir vídeos relacionados.

**Critérios de Aceitação:**
- [x] Analisa tags comuns entre vídeos
- [x] Retorna top 10 vídeos mais similares
- [x] Fallback para vídeos aleatórios se sem tags
- [x] Exclui vídeo atual da lista
- [x] Atualiza ao mudar de vídeo

---

#### F6: Filtros por Categoria
**Prioridade:** P2  
**Status:** ✅ Implementado

**Descrição:**
Filtros dinâmicos baseados nas tags mais populares.

**Critérios de Aceitação:**
- [x] Exibe top 8 tags mais frequentes
- [x] Filtro "Todos" sempre visível
- [x] Filtra vídeos ao clicar
- [x] Atualiza dinamicamente ao adicionar/remover vídeos

---

#### F7: Edição de Metadados
**Prioridade:** P2  
**Status:** ✅ Implementado

**Descrição:**
Permite editar título, descrição e avatar do canal.

**Critérios de Aceitação:**
- [x] Modal de edição com campos pré-preenchidos
- [x] Permite upload de avatar customizado (JPG, PNG)
- [x] Salva alterações no banco
- [x] Atualiza UI imediatamente
- [x] Validação de campos obrigatórios

---

#### F8: Histórico de Visualizações
**Prioridade:** P2  
**Status:** ✅ Implementado

**Descrição:**
Registra quando usuário assiste vídeos.

**Critérios de Aceitação:**
- [x] Marca vídeo como assistido ao abrir player
- [x] Salva timestamp da última visualização
- [x] Sidebar "Histórico" lista vídeos assistidos
- [x] Ordenação por data mais recente

---

#### F9: Interações Locais
**Prioridade:** P2  
**Status:** ✅ Implementado

**Descrição:**
Sistema de Like/Dislike local (não afeta YouTube).

**Critérios de Aceitação:**
- [x] Botões Like/Dislike no player
- [x] Contador exibe likes originais do YouTube
- [x] Interação do usuário altera estado visual
- [x] Persiste preferência no banco
- [x] Toggle (clicar novamente remove voto)

---

#### F10: Deletar Vídeos
**Prioridade:** P1  
**Status:** ✅ Implementado

**Descrição:**
Remove vídeo da biblioteca e do disco.

**Critérios de Aceitação:**
- [x] Botão deletar no player
- [x] Confirmação antes de deletar
- [x] Remove arquivo MP4, thumbnail e avatar
- [x] Remove entrada do banco
- [x] Atualiza UI automaticamente
- [x] Retorna ao feed após deletar

---

### 3.2 Funcionalidades Futuras (Roadmap)

#### F11: Playlists
**Prioridade:** P2  
**Status:** 📋 Planejado

**Descrição:**
Criar e organizar vídeos em playlists customizadas.

**Critérios de Aceitação:**
- [ ] Criar playlists com nome e descrição
- [ ] Adicionar/remover vídeos de playlists
- [ ] Visualizar playlist como feed filtrado
- [ ] Reprodução sequencial automática
- [ ] Reordenar vídeos na playlist (drag & drop)

---

#### F12: Download em Lote
**Prioridade:** P2  
**Status:** 📋 Planejado

**Descrição:**
Baixar múltiplos vídeos de uma vez.

**Critérios de Aceitação:**
- [ ] Input de múltiplas URLs (textarea)
- [ ] Fila de downloads com priorização
- [ ] Progress individual por vídeo
- [ ] Pausar/resumir downloads
- [ ] Retry automático em caso de falha

---

#### F13: Exportar/Importar Biblioteca
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Backup e sincronização entre dispositivos.

**Critérios de Aceitação:**
- [ ] Exportar metadados (JSON)
- [ ] Exportar vídeos + metadados (ZIP)
- [ ] Importar biblioteca de outro goTube
- [ ] Detecção de duplicatas
- [ ] Merge inteligente de bibliotecas

---

#### F14: Modo Teatro/Tela Cheia
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Modos de visualização alternativos.

**Critérios de Aceitação:**
- [ ] Botão de tela cheia no player
- [ ] Modo teatro (player expandido, sidebar oculta)
- [ ] Atalho de teclado (F para fullscreen)
- [ ] Sair com ESC

---

#### F15: Atalhos de Teclado
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Controle do player via teclado.

**Critérios de Aceitação:**
- [ ] Espaço: Play/Pause
- [ ] Setas: Avançar/Retroceder 5s
- [ ] M: Mute
- [ ] F: Fullscreen
- [ ] /: Focar busca

---

#### F16: Tema Claro
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Toggle entre tema escuro e claro.

**Critérios de Aceitação:**
- [ ] Botão de toggle no navbar
- [ ] Salva preferência localmente
- [ ] Cores consistentes em todos os componentes
- [ ] Transição suave entre temas

---

#### F17: Notificações Desktop
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Feedback visual fora da aplicação.

**Critérios de Aceitação:**
- [ ] Notificação ao concluir download
- [ ] Click na notificação abre aplicação
- [ ] Respeita configurações do sistema
- [ ] Opção de desabilitar

---

#### F18: Suporte Multiplataforma
**Prioridade:** P2  
**Status:** 📋 Planejado

**Descrição:**
Compatibilidade com Linux e macOS.

**Critérios de Aceitação:**
- [ ] Detecção automática de FFmpeg no PATH
- [ ] Fallback para FFmpeg bundled por plataforma
- [ ] Testes em Ubuntu, macOS, Windows
- [ ] Builds específicos para cada OS

---

#### F19: Integração com Outras Plataformas
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Download de outras plataformas de vídeo.

**Critérios de Aceitação:**
- [ ] Suporte a Vimeo
- [ ] Suporte a Dailymotion
- [ ] Detecção automática de plataforma pela URL
- [ ] Adaptadores específicos por plataforma

---

#### F20: Preview Hover
**Prioridade:** P3  
**Status:** 📋 Planejado

**Descrição:**
Preview de vídeo ao passar mouse no thumbnail.

**Critérios de Aceitação:**
- [ ] Gera storyboard ao baixar vídeo
- [ ] Exibe frames ao hover
- [ ] Animação suave de preview
- [ ] Configurável (on/off)

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance
- Tempo de download: < 2x duração do vídeo (conexão 10Mbps)
- Tempo de abertura do player: < 1s
- Busca: < 200ms para bibliotecas até 1000 vídeos
- UI responsiva (60fps) em operações de scroll

### 4.2 Usabilidade
- Interface intuitiva sem necessidade de tutorial
- Feedback visual para todas as ações
- Tratamento de erros com mensagens claras em português
- Design responsivo para resoluções 1280x720+

### 4.3 Confiabilidade
- Taxa de sucesso de downloads > 95%
- Backup automático do banco de dados
- Recuperação de downloads interrompidos (futuro)
- Validação de integridade de arquivos

### 4.4 Segurança
- Nenhum dado enviado a servidores externos (exceto YouTube para download)
- Sanitização de inputs para prevenir path traversal
- Validação de URLs antes de processar
- Armazenamento local criptografado (futuro)

### 4.5 Compatibilidade
- Windows 10/11 (64-bit)
- Requer Python 3.8+
- Disco: 2GB mínimo + espaço para vídeos
- RAM: 4GB mínimo

---

## 5. Arquitetura Técnica

### 5.1 Stack
- **Frontend:** Electron, HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Python 3
- **Download Engine:** pytubefix, FFmpeg
- **Storage:** File system + JSON database

### 5.2 Dependências Críticas
- `electron` - Framework desktop
- `pytubefix` - Download do YouTube
- `ffmpeg` - Processamento de mídia
- Python no PATH do sistema

### 5.3 Estrutura de Dados

**Video Metadata:**
```json
{
  "id": "string",
  "title": "string",
  "channel": "string",
  "description": "string",
  "duration": 0,
  "filePath": "string",
  "folderName": "string",
  "thumbnailRelative": "string",
  "channelAvatarRelative": "string",
  "downloadDate": "ISO8601",
  "url": "string",
  "tags": ["string"],
  "views": 0,
  "originalLikes": 0,
  "userInteraction": "like|dislike|null",
  "lastWatched": "ISO8601|null"
}
```

---

## 6. Casos de Uso

### 6.1 UC1: Baixar Vídeo
**Ator:** Usuário  
**Pré-condições:** Aplicação aberta, URL válida do YouTube  

**Fluxo Principal:**
1. Usuário clica em "Baixar Video"
2. Sistema abre modal
3. Usuário cola URL e seleciona qualidade
4. Usuário clica "Iniciar Download"
5. Sistema valida URL
6. Sistema inicia download com progress bar
7. Sistema combina vídeo e áudio
8. Sistema salva metadados
9. Sistema exibe vídeo no feed
10. Sistema fecha modal automaticamente

**Fluxos Alternativos:**
- 5a. URL inválida → Exibe erro
- 6a. Vídeo indisponível → Exibe erro específico
- 6b. Qualidade não disponível → Fallback automático

---

### 6.2 UC2: Assistir Vídeo
**Ator:** Usuário  
**Pré-condições:** Pelo menos 1 vídeo na biblioteca  

**Fluxo Principal:**
1. Usuário clica em thumbnail no feed
2. Sistema abre player
3. Sistema carrega vídeo
4. Sistema marca como assistido
5. Sistema carrega recomendações
6. Vídeo inicia automaticamente

**Fluxos Alternativos:**
- 3a. Arquivo não encontrado → Exibe erro, oferece remover do banco

---

### 6.3 UC3: Buscar Vídeo
**Ator:** Usuário  
**Pré-condições:** Aplicação aberta  

**Fluxo Principal:**
1. Usuário clica na barra de busca
2. Usuário digita termo
3. Usuário pressiona Enter ou clica na lupa
4. Sistema busca por título, canal, tags
5. Sistema exibe resultados em grid

**Fluxos Alternativos:**
- 4a. Nenhum resultado → Exibe mensagem "Nenhum vídeo encontrado"

---

### 6.4 UC4: Editar Vídeo
**Ator:** Usuário  
**Pré-condições:** Vídeo aberto no player  

**Fluxo Principal:**
1. Usuário clica em "Editar"
2. Sistema abre modal com dados atuais
3. Usuário modifica título/descrição/avatar
4. Usuário clica "Salvar"
5. Sistema valida campos
6. Sistema salva alterações
7. Sistema atualiza UI
8. Sistema fecha modal

**Fluxos Alternativos:**
- 5a. Título vazio → Exibe erro
- 3a. Usuário clica "Escolher Avatar" → Abre file picker

---

### 6.5 UC5: Deletar Vídeo
**Ator:** Usuário  
**Pré-condições:** Vídeo aberto no player  

**Fluxo Principal:**
1. Usuário clica em "Deletar"
2. Sistema solicita confirmação
3. Usuário confirma
4. Sistema remove arquivos do disco
5. Sistema remove do banco
6. Sistema retorna ao feed
7. Sistema exibe mensagem de sucesso

**Fluxos Alternativos:**
- 3a. Usuário cancela → Nada acontece
- 4a. Arquivo não encontrado → Remove apenas do banco

---

## 7. Restrições e Limitações

### 7.1 Técnicas
- Apenas Windows suportado (FFmpeg bundled)
- Requer Python instalado no sistema
- pytubefix pode quebrar com mudanças no YouTube
- Sem suporte a vídeos privados/age-restricted

### 7.2 Legais
- Usuário responsável por respeitar direitos autorais
- Aplicação para uso pessoal apenas
- Não redistribuir conteúdo baixado

### 7.3 De Negócio
- Projeto open-source/pessoal (sem monetização)
- Sem suporte oficial garantido
- Dependente de bibliotecas de terceiros

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| YouTube muda API | Alta | Alto | Manter pytubefix atualizado, sistema de tokens implementado |
| FFmpeg bugs | Baixa | Alto | Validação de output, logs detalhados |
| Disco cheio | Média | Médio | Verificar espaço antes de baixar, limpar temporários |
| Python não instalado | Média | Alto | Documentação clara, verificação no setup |
| Vídeos corrompidos | Baixa | Baixo | Validação de integridade (futuro) |

---

## 9. Cronograma e Entregas

### Fase 1: MVP ✅ (Concluído)
- [x] Download básico
- [x] Player integrado
- [x] Feed de vídeos
- [x] Busca simples

### Fase 2: Melhorias de UX ✅ (Concluído)
- [x] Sistema de recomendações
- [x] Edição de metadados
- [x] Histórico
- [x] Like/Dislike local
- [x] Filtros por categoria

### Fase 3: Estabilização e Segurança 🚧 (Em Progresso)
- [x] Autenticação anti-bot (po_token)
- [ ] contextBridge para IPC seguro
- [ ] Testes unitários
- [ ] Documentação completa

### Fase 4: Expansão 📋 (Planejado)
- [ ] Playlists
- [ ] Download em lote
- [ ] Suporte multiplataforma
- [ ] Integração outras plataformas

---

## 10. Glossário

- **po_token:** Token de autenticação do YouTube para evitar detecção de bot
- **visitor_data:** Dados de visitante para autenticação YouTube
- **Stream:** Fluxo de vídeo ou áudio individual do YouTube
- **Fallback:** Alternativa quando opção preferida não está disponível
- **ASAR:** Formato de arquivo do Electron para empacotar aplicação
- **IPC:** Inter-Process Communication (comunicação entre processos Electron)
- **Renderer:** Processo do Electron que renderiza a UI
- **Main:** Processo principal do Electron (backend)

---

## 11. Aprovações

**Product Owner:** [A definir]  
**Tech Lead:** [A definir]  
**Data:** 30/07/2026  

**Última Atualização:** 30/07/2026  
**Próxima Revisão:** Quando implementar Fase 4
