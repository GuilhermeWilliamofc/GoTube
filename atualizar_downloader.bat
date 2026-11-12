@echo off
chcp 65001 >nul
cls
echo =======================================================
echo          goTube - Atualizador do Motor de Download
echo =======================================================
echo.
echo [1/2] Verificando e atualizando a biblioteca pytubefix...
echo.

python -m pip install --upgrade pytubefix

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo  [SUCESSO] pytubefix atualizado com sucesso!
    echo  Voce ja pode reabrir o app e baixar os videos normalmente.
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo  [ERRO] Ocorreu uma falha ao atualizar.
    echo  Verifique sua conexao com a internet e se o Python
    echo  esta instalado no PATH do Windows.
    echo =======================================================
)

echo.
pause

