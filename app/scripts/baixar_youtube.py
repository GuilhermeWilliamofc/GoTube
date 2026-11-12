# -*- coding: utf-8 -*-
import sys
import os
import re
import json
import unicodedata
from pytubefix import YouTube
import subprocess
import urllib.request
from datetime import datetime

# Forcar stdout para UTF-8 no Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

url = sys.argv[1]
qualidade = sys.argv[2] if len(sys.argv) > 2 else "1080p"
downloads_base = sys.argv[3] if len(sys.argv) > 3 else "Downloads"

# Qualidades permitidas em ordem de prioridade (fallback)
QUALIDADES_PERMITIDAS = ["1080p", "720p", "480p", "360p", "144p"]

def custom_progress(stream, chunk, bytes_remaining):
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    if total_size > 0:
        percentage = (bytes_downloaded / total_size) * 100
        print(f"PROGRESS:{percentage:.2f}", flush=True)

def sanitizar_nome(nome):
    """Limpa o nome do arquivo removendo caracteres invalidos.
    
    Caracteres permitidos:
    - Letras (A-Z, a-z, incluindo acentos comuns do portugues)
    - Numeros (0-9)
    - Espaco
    - Traco (-)
    - Underscore (_)
    - Parenteses ( )
    - Pontos (.)
    - Virgulas (,)
    """
    # Normaliza unicode
    nome = unicodedata.normalize('NFKC', nome)
    
    # Whitelist: apenas letras (unicode), numeros, espaco, traco, underscore, parenteses, ponto, virgula
    nome = re.sub(r'[^\w\s()\-.,]', '', nome, flags=re.UNICODE)
    
    # Colapsa espacos e underscores multiplos
    nome = re.sub(r' +', ' ', nome)
    nome = re.sub(r'_+', '_', nome)
    
    return nome.strip(' _')

def sanitizar_texto(texto):
    """Limpa texto para metadados, mantendo mais caracteres mas removendo problematicos."""
    if not texto:
        return ""
    texto = unicodedata.normalize('NFKC', texto)
    # Remove caracteres de controle e emojis, mantendo pontuacao comum
    texto = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', texto)
    return texto.strip()

def escolher_qualidade(video, qualidade_desejada):
    """Escolhe a melhor qualidade disponivel, com fallback automatico."""
    # Encontra o indice da qualidade desejada
    try:
        idx = QUALIDADES_PERMITIDAS.index(qualidade_desejada)
    except ValueError:
        idx = 0  # Default para 1080p
    
    # Tenta da qualidade desejada para baixo
    for q in QUALIDADES_PERMITIDAS[idx:]:
        stream = video.streams.filter(
            file_extension='mp4', 
            only_video=True, 
            resolution=q
        ).first()
        if stream:
            print(f"QUALITY:{q}", flush=True)
            return stream
    
    # Ultimo fallback: melhor stream de video disponivel
    stream = video.streams.filter(
        file_extension='mp4', 
        only_video=True
    ).order_by('resolution').desc().first()
    
    if stream:
        print(f"QUALITY:{stream.resolution}", flush=True)
    return stream

def criar_instancia_youtube(url):
    """Cria instancia do YouTube testando clientes alternativos em caso de deteccao de bot."""
    # Clientes InnerTube suportados pelo pytubefix (tenta default, WEB, MWEB, VISION_OS, ANDROID_VR)
    clientes = [None, 'WEB', 'MWEB', 'VISION_OS', 'ANDROID_VR']
    ultimo_erro = None
    
    for cliente in clientes:
        try:
            kwargs = {'on_progress_callback': custom_progress}
            if cliente:
                kwargs['client'] = cliente
            yt = YouTube(url, **kwargs)
            # Acessa o titulo para validar a requisicao e detectar bloqueios de bot
            _ = yt.title
            return yt
        except Exception as e:
            ultimo_erro = e
            continue
            
    if ultimo_erro:
        raise ultimo_erro
    raise Exception("Nao foi possivel inicializar o download do YouTube.")

def criarpastavideo(url):
    video = criar_instancia_youtube(url)
    
    title = video.title
    title_sanitizado = sanitizar_nome(title)
    
    print(f"TITLE:{sanitizar_texto(title)}", flush=True)
    
    pasta_nome = f'Video - {title_sanitizado}'
    pasta_download = os.path.join(downloads_base, pasta_nome)
    os.makedirs(pasta_download, exist_ok=True)
    
    # Baixar thumbnail
    thumb_relative = None
    thumb_path = os.path.join(pasta_download, 'thumbnail.jpg')
    if hasattr(video, 'thumbnail_url') and video.thumbnail_url:
        try:
            req = urllib.request.Request(video.thumbnail_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(thumb_path, 'wb') as out_file:
                out_file.write(response.read())
            thumb_relative = os.path.join(pasta_nome, 'thumbnail.jpg')
            print(f"THUMBNAIL:{thumb_relative}", flush=True)
        except Exception:
            pass
    
    # Tentar baixar avatar do canal
    avatar_relative = None
    avatar_path = os.path.join(pasta_download, 'channel_avatar.jpg')
    try:
        # Tenta obter URL do avatar do canal via pytubefix
        if hasattr(video, 'channel_url') and video.channel_url:
            # Construir URL do avatar baseado no channel_id
            # Formato: https://yt3.ggpht.com/ytc/channel_id
            channel_id = video.channel_id if hasattr(video, 'channel_id') else None
            if channel_id:
                # YouTube usa varios tamanhos, s800 eh alta resolucao
                avatar_url = f"https://yt3.ggpht.com/ytc/{channel_id}=s800-c-k-c0x00ffffff-no-rj"
                req = urllib.request.Request(avatar_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response, open(avatar_path, 'wb') as out_file:
                    out_file.write(response.read())
                avatar_relative = os.path.join(pasta_nome, 'channel_avatar.jpg')
                print(f"CHANNEL_AVATAR:{avatar_relative}", flush=True)
    except Exception:
        # Se falhar, nao tem problema - usuario pode adicionar manualmente
        pass
            
    return pasta_download, pasta_nome, title, video, thumb_relative, avatar_relative

def combinar_video_audio(video_path, audio_path, output_path, ffmpeg_path):
    print("STATUS:Combinando audio e video...", flush=True)
    comando = [
        ffmpeg_path, '-y',
        '-i', video_path,
        '-i', audio_path,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_path
    ]
    subprocess.run(comando, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(video_path)
    os.remove(audio_path)
    return output_path

def baixar(video, title, pasta, ffmpeg_path, qualidade_desejada):
    print("STATUS:Buscando melhor qualidade...", flush=True)
    title_safe = sanitizar_nome(title)
    
    # Selecionar stream de video com fallback
    video_stream = escolher_qualidade(video, qualidade_desejada)
    if not video_stream:
        print("ERROR:Nenhuma stream de video encontrada", flush=True)
        return None
    
    # Audio sempre na melhor qualidade
    audio_stream = video.streams.filter(only_audio=True).order_by('abr').desc().first()
    if not audio_stream:
        print("ERROR:Nenhuma stream de audio encontrada", flush=True)
        return None
    
    print("STATUS:Baixando video...", flush=True)
    local_video = video_stream.download(filename=f'{title_safe}_video.mp4', output_path=pasta)
    
    print("STATUS:Baixando audio...", flush=True)
    local_audio = audio_stream.download(filename=f'{title_safe}_audio.mp3', output_path=pasta)

    final_output = os.path.join(pasta, f'{title_safe}.mp4')
    combinar_video_audio(local_video, local_audio, final_output, ffmpeg_path)
    
    return os.path.abspath(final_output)

# ---- Execucao Principal ----
ffmpeg_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ffmpeg.exe')

try:
    pasta_download, pasta_nome, title, video, thumb_relative, avatar_relative = criarpastavideo(url)
    final_path = baixar(video, title, pasta_download, ffmpeg_path, qualidade)
    
    if final_path:
        # Tentar extrair likes do vid_info se disponivel
        original_likes = 0
        try:
            # Em algumas versoes do pytube/pytubefix a info de likes vem no vid_info
            if hasattr(video, 'vid_info') and isinstance(video.vid_info, dict):
                contents = video.vid_info.get('contents', {})
                # E muito instavel pegar likes e avatar sem scraping de terceiros,
                # entao inicializamos em 0/vazio para o fallback do Frontend cuidar
                pass
        except Exception:
            pass

        metadata = {
            "id": re.sub(r'[^a-zA-Z0-9]', '', url.split('v=')[-1].split('&')[0]) if 'v=' in url else str(hash(url)),
            "title": sanitizar_texto(video.title),
            "channel": sanitizar_texto(video.author) if hasattr(video, 'author') else "Desconhecido",
            "description": sanitizar_texto(video.description) if hasattr(video, 'description') else "",
            "duration": video.length if hasattr(video, 'length') else 0,
            "filePath": final_path,
            "folderName": pasta_nome,
            "thumbnailRelative": thumb_relative or "",
            "channelAvatarRelative": avatar_relative or "",
            "downloadDate": datetime.now().isoformat(),
            "url": url,
            "tags": list(video.keywords) if hasattr(video, 'keywords') and video.keywords else [],
            "views": video.views if hasattr(video, 'views') else 0,
            "originalLikes": original_likes
        }
        
        # Sanitizar tags
        metadata["tags"] = [sanitizar_texto(t) for t in metadata["tags"] if t]
        
        metadata_json = json.dumps(metadata, ensure_ascii=False)
        print(f"METADATA:{metadata_json}", flush=True)
        print(f"DONE:{final_path}", flush=True)
        
except Exception as e:
    print(f"ERROR:{str(e)}", flush=True)
