#!/usr/bin/env python3
"""
Endorfina Hub — gerador de derivadas de imagem (webp + variantes 800w)

Le todo .jpg/.jpeg em assets/img/ (exceto os que ja terminam em "-800w",
que sao derivadas, nao fonte) e gera, para cada um:

  <nome>.webp          mesma largura do original, qualidade 80, method=6
  <nome>-800w.jpg      largura 800px (ou a largura original, se menor),
                        qualidade 78, optimize, progressive
  <nome>-800w.webp     largura 800px (ou a largura original, se menor),
                        qualidade 78, method=6

Idempotente: rodar de novo so regrava os mesmos arquivos, sem duplicar nada.
Nunca toca no .jpg/.jpeg de origem.

Uso:
    python tools/gerar-imagens.py
"""

import os
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "assets", "img")

TARGET_800W = 800

WEBP_FULL_QUALITY = 80
WEBP_800W_QUALITY = 78
JPEG_800W_QUALITY = 78


def is_source(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".jpg", ".jpeg"):
        return False
    stem = os.path.splitext(filename)[0]
    return not stem.endswith("-800w")


def load_rgb(path):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")
    return im


def resized_to_width(im, target_width):
    w, h = im.size
    if w <= target_width:
        return im, False  # sem upscale — devolve como esta, sinaliza "nao redimensionado"
    new_h = round(h * (target_width / w))
    return im.resize((target_width, new_h), Image.LANCZOS), True


def main():
    if not os.path.isdir(IMG_DIR):
        print(f"ERRO: pasta nao encontrada: {IMG_DIR}", file=sys.stderr)
        sys.exit(1)

    sources = sorted(f for f in os.listdir(IMG_DIR) if is_source(f))

    if not sources:
        print("Nenhum arquivo-fonte (.jpg/.jpeg, sem sufixo -800w) encontrado em assets/img/.")
        sys.exit(0)

    lidos = 0
    gerados = 0
    avisos = []
    peso_antes = 0
    peso_depois_webp = 0
    linhas_resumo = []

    for filename in sources:
        stem = os.path.splitext(filename)[0]
        src_path = os.path.join(IMG_DIR, filename)
        src_size_kb = os.path.getsize(src_path) / 1024
        peso_antes += src_size_kb
        lidos += 1

        try:
            im = load_rgb(src_path)
        except Exception as e:
            avisos.append(f"ILEGÍVEL: {filename} — {e}")
            continue

        w, h = im.size

        # <nome>.webp — largura cheia
        webp_full_path = os.path.join(IMG_DIR, f"{stem}.webp")
        im.save(webp_full_path, "WEBP", quality=WEBP_FULL_QUALITY, method=6)
        gerados += 1
        webp_full_kb = os.path.getsize(webp_full_path) / 1024
        peso_depois_webp += webp_full_kb
        linhas_resumo.append(
            f"{stem}.webp          {w}x{h}    {webp_full_kb:7.1f} KB"
        )

        # <nome>-800w.jpg e <nome>-800w.webp
        im_800, foi_redimensionado = resized_to_width(im, TARGET_800W)
        w800, h800 = im_800.size

        if not foi_redimensionado:
            avisos.append(
                f"{filename}: largura original ({w}px) já é <= {TARGET_800W}px — "
                f"variante -800w gerada na largura original ({w800}px), sem upscale."
            )

        jpg_800w_path = os.path.join(IMG_DIR, f"{stem}-800w.jpg")
        im_800.save(
            jpg_800w_path,
            "JPEG",
            quality=JPEG_800W_QUALITY,
            optimize=True,
            progressive=True,
        )
        gerados += 1
        jpg_800w_kb = os.path.getsize(jpg_800w_path) / 1024
        linhas_resumo.append(
            f"{stem}-800w.jpg     {w800}x{h800}    {jpg_800w_kb:7.1f} KB"
        )

        webp_800w_path = os.path.join(IMG_DIR, f"{stem}-800w.webp")
        im_800.save(webp_800w_path, "WEBP", quality=WEBP_800W_QUALITY, method=6)
        gerados += 1
        webp_800w_kb = os.path.getsize(webp_800w_path) / 1024
        peso_depois_webp += webp_800w_kb
        linhas_resumo.append(
            f"{stem}-800w.webp    {w800}x{h800}    {webp_800w_kb:7.1f} KB"
        )

    print("=" * 60)
    print("Endorfina Hub — geração de derivadas de imagem")
    print("=" * 60)
    for linha in linhas_resumo:
        print(linha)
    print("-" * 60)
    print(f"Fontes lidas:      {lidos}")
    print(f"Arquivos gerados:  {gerados}")
    print(f"Peso total fontes (.jpg originais): {peso_antes:8.1f} KB")
    print(f"Peso total .webp gerados (full + 800w): {peso_depois_webp:8.1f} KB")
    if avisos:
        print("-" * 60)
        print("Avisos:")
        for a in avisos:
            print(f"  - {a}")
    print("=" * 60)


if __name__ == "__main__":
    main()
