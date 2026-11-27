#  ███╗   ██╗ ██████╗ ███████╗██╗
#  ████╗  ██║██╔═══██╗██╔════╝██║
#  ██╔██╗ ██║██║   ██║█████╗  ██║
#  ██║╚██╗██║██║   ██║██╔══╝  ██║
#  ██║ ╚████║╚██████╔╝███████╗███████╗
#  ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝
#  ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗
#  ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
#  ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
#  ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
#  ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
#  ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝
#  ──────── by Raúl · Chihuahua, MX ────────
"""Une las secciones y genera index.html, sitio.css y sitio.js.

Uso: python3 construir.py
Edita secciones/, estilos/ y js/. No edites los archivos generados.
"""
import html
import json
import os
import re
from pathlib import Path

RAIZ = Path(__file__).parent

# Datos que se repiten en todo el sitio. Cámbialos solo aquí.
DATOS = {
    "BASE": "../",  # Al publicar en la raíz del sitio, cambiar a ""
    "TEL": "614 225 1419",
    "WA": "https://wa.me/526142251419",
    "CORREO": "contacto.noelstudio@gmail.com",
    "ANIO": "2026",
    # Llave pública de Retell (empieza con public_key_). Sin llave, el botón se oculta.
    "RETELL_LLAVE": os.environ.get("RETELL_LLAVE", "public_key_fbd8d71501f324c5a6b9c"),
    "RETELL_AGENTE": "agent_cf2ef29399ba0b6b0f5967cdc7",
    # Llave de SITIO de Google reCAPTCHA v3 (es publica). Vacia = sin reCAPTCHA.
    "RECAPTCHA": "6LcpVBouAAAAACb9FAMv_eb3kkUP20ixmPtj3gUs",
}

# Paginas del sitio. Cada una arma sus secciones en este orden.
COMUNES_ANTES = ["nav"]
COMUNES_DESPUES = ["pie", "movil-barra", "agente"]
PAGINAS = {
    "index.html": {
        "titulo": "Agentes de IA para llamadas y WhatsApp | Noel Studio Chihuahua",
        "descripcion": "Agentes de inteligencia artificial que contestan las llamadas y el WhatsApp de tu negocio, además de páginas web, videos y tarjetas NFC. Chihuahua, México.",
        "secciones": ["hero", "problema", "servicios", "voces", "portafolio", "resenas", "cierre"],
        "cierre": "Que la siguiente llamada sí se conteste.",
    },
    "llamadas.html": {
        "titulo": "Agente de llamadas con IA en Chihuahua | Noel Studio",
        "descripcion": "Un agente con voz natural contesta el teléfono de tu negocio, informa, toma pedidos y te deja el recado por escrito. Escucha las voces y revisa los planes.",
        "icono": "phone",
        "cabecera": ("Llamadas con IA", "Tu teléfono contesta al primer timbre.", "Tu agente de IA atiende, informa y te deja cada recado por escrito, aunque tú estés ocupado."),
        "secciones": ["llamada", "voces", "giros", "planes", "proceso", "preguntas"],
        "temas": ["agentes", "general"],
    },
    "whatsapp.html": {
        "titulo": "WhatsApp automático con IA en Chihuahua | Noel Studio",
        "descripcion": "Un agente de inteligencia artificial responde dudas, aparta citas y toma pedidos por el WhatsApp de tu negocio, las 24 horas. Planes desde 1,799 pesos al mes.",
        "icono": "message-circle",
        "cabecera": ("WhatsApp automático", "Cada mensaje recibe respuesta.", "Responde con la información de tu negocio y te avisa cuando alguien quiere comprar."),
        "secciones": ["chat-whatsapp", "whatsapp", "proceso", "preguntas", "cierre"],
        "temas": ["agentes", "general"],
        "cierre": "Que ningún mensaje se quede sin respuesta.",
        "cierre_texto": "Lo armo con la información de tu negocio para que lo pruebes antes de pagar.",
    },
    "paginas-web.html": {
        "titulo": "Páginas web en Chihuahua | Noel Studio",
        "descripcion": "Páginas web para negocios en Chihuahua desde 4,500 pesos: hechas desde cero, con tienda y terminal de pago, correo profesional y presencia en Google.",
        "icono": "globe",
        "cabecera": ("Páginas web", "Tu negocio, bien presentado en internet.", "Páginas hechas desde cero, rápidas y listas para que Google las encuentre."),
        "secciones": ["portafolio", "web", "resenas", "preguntas", "cierre"],
        "temas": ["web", "general"],
        "cierre": "Tu próxima página puede ser esta.",
        "cierre_boton": "Quiero mi página",
        "cierre_texto": "Te enseño cómo se vería tu página antes de empezar.",
        "lcp": "demo-elgarage.webp",
        "pie": "¿Listo para empezar?",
    },
    "creativos.html": {
        "titulo": "Videos y diseño para negocios en Chihuahua | Noel Studio",
        "descripcion": "Videos para Reels y TikTok, video corporativo, diseño para campañas, logo, marca, catálogos y menús para negocios de Chihuahua. Precios desde 800 pesos.",
        "icono": "clapperboard",
        "cabecera": ("Estudio creativo", "Piezas que hacen que se detengan a verte.", "Videos, diseño y marca para que tu negocio se vea profesional en redes."),
        "secciones": ["creativos", "cierre"],
        "cierre": "Hagamos que tu negocio se vea.",
        "cierre_boton": "Cotizar mi pieza",
        "cierre_texto": "Cuéntame qué vendes y te propongo la primera pieza antes de empezar.",
        "pie": "¿Listo para empezar?",
    },
    "tarjetas-nfc.html": {
        "titulo": "Tarjetas y soportes NFC para negocios | Noel Studio Chihuahua",
        "descripcion": "Soportes de mesa y tarjetas de reseñas con NFC y QR, diseñados con tu marca en Chihuahua. Un toque abre tu WhatsApp, tu menú o tu perfil de Google.",
        "icono": "nfc",
        "cabecera": ("Tarjetas NFC", "Un toque y tu cliente ya está contigo.", "Acercan el celular y se abre tu WhatsApp, tu menú o tus reseñas de Google."),
        "secciones": ["nfc", "preguntas", "cierre"],
        "temas": ["nfc", "general"],
        "cierre": "Que cada mesa te traiga un cliente.",
        "cierre_boton": "Pedir mi muestra",
        "cierre_texto": "Te mando la muestra del diseño con tu marca antes de imprimir.",
        "lcp": "tablilla-despues.webp",
        "pie": "¿Listo para empezar?",
    },
    "contacto.html": {
        "titulo": "Contacto | Noel Studio Chihuahua",
        "descripcion": "Habla con Raúl de Noel Studio por WhatsApp, correo o agenda una visita a tu negocio. Agentes de IA, páginas web y diseño en Chihuahua, México.",
        "icono": "mail",
        "cabecera": ("Contacto", "Hablemos de tu negocio.", "Escríbeme por WhatsApp o déjame tus datos. Te digo qué te conviene y cuánto cuesta."),
        "secciones": ["agenda", "contacto", "raul", "preguntas"],
        "temas": ["agentes", "web", "general"],
        "pie": "¿Listo para empezar?",
    },
}


def sin_firma(texto):
    """Quita la firma de cada archivo para no repetirla en lo generado."""
    texto = re.sub(r"\A<!--.*?by Raúl.*?-->\s*", "", texto, flags=re.S)
    texto = re.sub(r"\A/\*.*?by Raúl.*?\*/\s*", "", texto, flags=re.S)
    return re.sub(r"\A(?://.*\n)+\s*", "", texto)


def leer(ruta):
    return sin_firma(ruta.read_text(encoding="utf-8"))


def poner_datos(texto):
    for clave, valor in DATOS.items():
        texto = texto.replace("{{" + clave + "}}", valor)
    return texto


def esquema_preguntas(cuerpo):
    """Crea los datos de preguntas para Google desde la sección visible."""
    # Solo las preguntas reales (<details data-tema>), no los grupos de planes.
    pares = re.findall(r'<details[^>]*\bdata-tema="[a-z]+"[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>', cuerpo, re.S)
    if not pares:
        return ""  # Sin preguntas no se escribe el bloque (Google marca error si va vacío).
    limpio = lambda t: html.unescape(re.sub(r"<[^>]+>", "", t)).strip()
    datos = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": limpio(pregunta),
                "acceptedAnswer": {"@type": "Answer", "text": limpio(respuesta)},
            }
            for pregunta, respuesta in pares
        ],
    }
    texto = json.dumps(datos, ensure_ascii=False).replace("</", "<\\/")
    return '<script type="application/ld+json">' + texto + "</script>"


def iconos(texto):
    """Cambia {{ICONO:nombre}} por el dibujo de linea de iconos/nombre.svg."""
    def poner(m):
        svg = (RAIZ / "iconos" / f"{m.group(1)}.svg").read_text(encoding="utf-8")
        svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S).strip()
        svg = re.sub(r'class="[^"]*"', 'class="icono" aria-hidden="true" focusable="false"', svg, count=1)
        return re.sub(r"\s+", " ", svg)
    return re.sub(r"\{\{ICONO:([a-z-]+)\}\}", poner, texto)


def filtrar(html_seccion, datos):
    """Deja solo las preguntas del tema de la pagina y pone su cierre."""
    html_seccion = html_seccion.replace("{{CIERRE}}", datos.get("cierre", "Que la siguiente llamada sí se conteste."))
    html_seccion = html_seccion.replace("{{CIERRE_BOTON}}", datos.get("cierre_boton", "Quiero mi prueba"))
    html_seccion = html_seccion.replace("{{CIERRE_TEXTO}}", datos.get("cierre_texto", "Te armo una prueba con la información de tu negocio para que la escuches antes de pagar."))
    temas = datos.get("temas")
    if not temas or "data-tema" not in html_seccion:
        return html_seccion
    html_seccion = re.sub(
        r'\s*<details data-tema="([a-z]+)">.*?</details>',
        lambda m: m.group(0) if m.group(1) in temas else "",
        html_seccion,
        flags=re.S,
    )
    return html_seccion.replace("<details data-tema", "<details open data-tema", 1)


def cabecera(datos, icono):
    miga, titulo, texto = datos
    return f"""<section class="cabecera" data-mundo="pleno">
  <div class="contenedor cabecera__rejilla">
    <div class="cabecera__texto">
      <nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><span>{miga}</span></nav>
      <h1>{titulo}</h1>
      <p>{texto}</p>
    </div>
    <div class="emblema" aria-hidden="true"><span class="emblema__anillo"></span><span class="emblema__anillo"></span><span class="emblema__centro">{{{{ICONO:{icono}}}}}</span></div>
  </div>
</section>"""


# Cambia en cada construccion para que el navegador no use archivos viejos.
VERSION = str(int(__import__("time").time()))


SITIO = "https://noelstudioweb.com/"
# Carpetas que la pagina usa y que se copian al publicar en la raiz.
CARPETAS = ["fuentes", "voces", "creativos", "nfc"]


def main(publicar=False):
    """Sin argumentos genera la vista de prueba en nuevo/.
    Con --publicar genera el sitio oficial en la raiz del repo (indexable)."""
    destino = RAIZ.parent if publicar else RAIZ
    DATOS["BASE"] = "" if publicar else "../"
    plantilla = leer(RAIZ / "plantilla.html")
    if publicar:
        plantilla = re.sub(r"<!-- Quitar al publicar.*?-->\s*<meta name=\"robots\"[^>]*>\s*", "", plantilla, flags=re.S)
    firma = (RAIZ / "plantilla.html").read_text(encoding="utf-8").split("-->")[0] + "-->\n"
    for archivo, datos in PAGINAS.items():
        antes = "\n".join(leer(RAIZ / "secciones" / f"{n}.html") for n in COMUNES_ANTES)
        antes = antes.replace(f'href="{archivo}"', f'href="{archivo}" aria-current="page"')
        partes = [cabecera(datos["cabecera"], datos.get("icono", "sparkles"))] if "cabecera" in datos else []
        partes += [filtrar(leer(RAIZ / "secciones" / f"{n}.html"), datos) for n in datos["secciones"]]
        principal = "\n".join(partes)
        despues = "\n".join(leer(RAIZ / "secciones" / f"{n}.html") for n in COMUNES_DESPUES)
        cuerpo = antes + '\n<main id="principal">\n' + principal + "\n</main>\n" + despues
        pagina = plantilla.replace("{{CUERPO}}", cuerpo)
        pagina = pagina.replace("sitio.css", f"sitio.css?v={VERSION}").replace("sitio.js", f"sitio.js?v={VERSION}")
        esquema = esquema_preguntas(principal)
        pagina = pagina.replace("{{ESQUEMA}}\n", esquema + "\n" if esquema else "")
        pagina = pagina.replace("{{PIE_PREGUNTA}}", datos.get("pie", "¿Listo para que tu negocio conteste siempre?"))
        pagina = pagina.replace("{{TITULO}}", html.escape(datos["titulo"])).replace("{{DESCRIPCION}}", html.escape(datos["descripcion"]))
        # La imagen principal de la pagina carga primero, sin esperar (mejora el LCP).
        if datos.get("lcp"):
            pagina = re.sub(
                r'(<img [^>]*src="[^"]*' + re.escape(datos["lcp"]) + r'"[^>]*?) loading="lazy"',
                r'\1 loading="eager" fetchpriority="high"',
                pagina,
                count=1,
            )
        if publicar:
            url = SITIO + ("" if archivo == "index.html" else archivo)
            pagina = pagina.replace('<meta name="description"', f'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">\n<meta name="description"', 1)
        # Solo se pide una foto si el archivo existe; si no, queda la inicial.
        pagina = re.sub(
            r' data-foto="([^"]+)"',
            lambda m: m.group(0) if (RAIZ / m.group(1)).exists() else "",
            pagina,
        )
        (destino / archivo).write_text(firma + iconos(poner_datos(pagina)), encoding="utf-8")

    archivos = sorted((RAIZ / "estilos").glob("*.css"))
    archivos += sorted((RAIZ / "estilos" / "movil").glob("*.css"))
    css = "\n".join(leer(p) for p in archivos)
    (destino / "sitio.css").write_text(poner_datos(css), encoding="utf-8")

    js = "\n".join(leer(p) for p in sorted((RAIZ / "js").glob("*.js")))
    (destino / "sitio.js").write_text(js, encoding="utf-8")

    if publicar:
        import shutil
        for carpeta in CARPETAS:
            shutil.copytree(RAIZ / carpeta, destino / carpeta, dirs_exist_ok=True)
        hoy = __import__("datetime").date.today().isoformat()
        urls = "".join(
            f"  <url><loc>{SITIO}{'' if a == 'index.html' else a}</loc><lastmod>{hoy}</lastmod></url>\n"
            for a in PAGINAS
        )
        (destino / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n",
            encoding="utf-8",
        )
        # Paginas viejas: mandan a su equivalente nuevo para no perder visitas ni Google.
        for viejo, nuevo in {"agentes-ia.html": "llamadas.html", "portafolio.html": "index.html#portafolio"}.items():
            (destino / viejo).write_text(
                f'<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>Noel Studio</title>'
                f'<link rel="canonical" href="{SITIO}{nuevo.split("#")[0].replace("index.html", "")}">'
                f'<meta http-equiv="refresh" content="0; url={nuevo}"></head>'
                f'<body><a href="{nuevo}">Ir a Noel Studio</a></body></html>\n',
                encoding="utf-8",
            )
        print(f"Publicado en la raiz: {len(PAGINAS)} páginas + sitemap + redirecciones.")
    else:
        print(f"Listo: {len(PAGINAS)} páginas.")


if __name__ == "__main__":
    import sys
    main(publicar="--publicar" in sys.argv)
