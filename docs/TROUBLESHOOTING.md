# Resolução de Problemas: Motor de Download (goTube)

Este guia serve como referência rápida para resolver falhas comuns no download/importação de vídeos, em especial erros relacionados a atualizações e proteções de plataformas web (como detecção de bot).

---

## ⚡ Atalhos Rápidos (Correção em 1 Passo)

Se o app apresentar erro ao tentar importar vídeos remotos, na maioria dos casos a plataforma web apenas atualizou suas regras e basta atualizar a biblioteca `pytubefix`.

### Opção 1: Atalho de 2 Cliques (Recomendado)
Dê um duplo clique no arquivo **`atualizar_downloader.bat`** localizado na raiz do projeto. Ele atualizará a biblioteca automaticamente e informará o resultado.

### Opção 2: Pelo Terminal do Projeto (npm)
No terminal, dentro da pasta do projeto, execute:
```bash
npm run fix-download
```

### Opção 3: Comando Direto do Python
```bash
python -m pip install --upgrade pytubefix
```

Após atualizar, feche e reabra o aplicativo e tente o download novamente.

---

## 🔍 Problemas Frequentes

### 1. `This request was detected as a bot. DO NOT OPEN AN ISSUE! (...)`
* **Causa:** O provedor web reforçou a validação anti-bot (*BotGuard* e *Proof of Origin Token - PO Token*) e bloqueou o cliente interno simulado pela versão antiga da biblioteca.
* **Solução:** 
  1. Execute o atalho de atualização (`atualizar_downloader.bat` ou `npm run fix-download`).
  2. O script `app/scripts/baixar_youtube.py` já possui um sistema de **fallback automático** que tenta diferentes clientes (`WEB`, `MWEB`, `VISION_OS`, etc.). Ao atualizar a biblioteca para a versão mais recente, novos contornos e clientes são disponibilizados.

---

### 2. `KeyError: 'videoDetails'` ou `RegexMatchError`
* **Causa:** O provedor web alterou a estrutura do player JavaScript, quebrando as expressões regulares usadas para extrair título e streams.
* **Solução:** Atualizar o `pytubefix` via `npm run fix-download`. Se o erro persistir imediatamente após a alteração do provedor, aguarde até que a equipe do `pytubefix` lance uma nova versão (ou veja a alternativa abaixo).

---

### 3. Falha na Junção de Áudio e Vídeo (FFmpeg)
* **Causa:** O binário do `ffmpeg.exe` não foi encontrado ou está corrompido.
* **Verificação:** Certifique-se de que o arquivo `app/scripts/ffmpeg.exe` existe.

---

## 🧪 Como Testar o Download Diretamente pelo Terminal

Se quiser testar sem precisar abrir a interface do app:

```bash
python app/scripts/baixar_youtube.py "URL_DO_VIDEO" "720p" "Downloads"
```

O terminal exibirá o passo a passo (`PROGRESS`, `STATUS`, `METADATA`, `DONE`) ou a mensagem de erro exata que está ocorrendo.

---

## 🛡️ Alternativa de Longo Prazo: `yt-dlp`

Caso em algum momento futuro o YouTube implemente uma mudança drástica e o `pytubefix` demore a ser atualizado pelos mantenedores, o **`yt-dlp`** é a biblioteca de download mais ativa e resiliente da comunidade open-source.

Para testar/instalar caso necessário:
```bash
python -m pip install -U yt-dlp
```
E as chamadas em `baixar_youtube.py` podem ser adaptadas para usar a CLI ou a biblioteca Python do `yt-dlp`.

