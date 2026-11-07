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
}

# Paginas del sitio. Cada una arma sus secciones en este orden.
COMUNES_ANTES = ["nav"]
COMUNES_DESPUES = ["pie", "movil-barra", "agente"]
PAGINAS = {
    "index.html": {
        "titulo": "Agentes de IA que contestan tu negocio | Noel Studio Chihuahua",
        "descripcion": "Agentes de inteligencia artificial que contestan llamadas y WhatsApp, páginas web y creativos para negocios. Chihuahua, México.",
        "secciones": ["hero", "problema", "servicios", "voces", "portafolio", "resenas", "cierre"],
    },
    "llamadas.html": {
        "titulo": "Agente de llamadas con IA | Noel Studio",
        "descripcion": "Un agente con voz natural que contesta tu teléfono, informa y te deja el recado. Escucha las voces y pruébalo en vivo.",
        "cabecera": ("Llamadas con IA", "Tu teléfono contesta al primer timbre.", "Claudia atiende, informa y te deja cada recado por escrito, aunque tú estés ocupado."),
        "secciones": ["llamada", "voces", "giros", "planes", "proceso", "preguntas"],
    },
    "whatsapp.html": {
        "titulo": "WhatsApp automático para negocios | Noel Studio",
        "descripcion": "Un agente de inteligencia artificial que responde dudas, aparta citas y toma pedidos por WhatsApp.",
        "cabecera": ("WhatsApp automático", "Cada mensaje recibe respuesta.", "Responde con la información de tu negocio y te avisa cuando alguien quiere comprar."),
        "secciones": ["whatsapp", "chat-whatsapp", "proceso", "preguntas", "cierre"],
    },
    "paginas-web.html": {
        "titulo": "Páginas web en Chihuahua | Noel Studio",
        "descripcion": "Páginas web desde 4,500 pesos, tienda con terminal de pago, correo profesional y Google.",
        "cabecera": ("Páginas web", "Tu negocio, bien presentado en internet.", "Páginas hechas desde cero, rápidas y listas para que Google las encuentre."),
        "secciones": ["web", "portafolio", "resenas", "preguntas", "cierre"],
    },
    "creativos.html": {
        "titulo": "Estudio creativo: videos y diseño | Noel Studio",
        "descripcion": "Videos para redes, diseño para campañas, logo, marca, catálogos y menús.",
        "cabecera": ("Estudio creativo", "Piezas que hacen que se detengan a verte.", "Videos, diseño y marca para que tu negocio se vea profesional en redes."),
        "secciones": ["creativos", "portafolio", "cierre"],
    },
    "contacto.html": {
        "titulo": "Contacto | Noel Studio Chihuahua",
        "descripcion": "Habla con Raúl de Noel Studio por WhatsApp o correo. Chihuahua, México.",
        "cabecera": ("Contacto", "Hablemos de tu negocio.", "Escríbeme por WhatsApp o déjame tus datos. Te digo qué te conviene y cuánto cuesta."),
        "secciones": ["contacto", "raul", "preguntas"],
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
    pares = re.findall(r"<summary>(.*?)</summary>\s*<p>(.*?)</p>", cuerpo, re.S)
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
    return json.dumps(datos, ensure_ascii=False)


def cabecera(datos):
    miga, titulo, texto = datos
    return f"""<section class="cabecera" data-mundo="pleno">
  <div class="contenedor">
    <nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><span>{miga}</span></nav>
    <h1>{titulo}</h1>
    <p>{texto}</p>
  </div>
</section>"""


def main():
    plantilla = leer(RAIZ / "plantilla.html")
    firma = (RAIZ / "plantilla.html").read_text(encoding="utf-8").split("-->")[0] + "-->\n"
    for archivo, datos in PAGINAS.items():
        antes = "\n".join(leer(RAIZ / "secciones" / f"{n}.html") for n in COMUNES_ANTES)
        antes = antes.replace(f'href="{archivo}"', f'href="{archivo}" aria-current="page"')
        partes = [cabecera(datos["cabecera"])] if "cabecera" in datos else []
        partes += [leer(RAIZ / "secciones" / f"{n}.html") for n in datos["secciones"]]
        principal = "\n".join(partes)
        despues = "\n".join(leer(RAIZ / "secciones" / f"{n}.html") for n in COMUNES_DESPUES)
        cuerpo = antes + '\n<main id="principal">\n' + principal + "\n</main>\n" + despues
        pagina = plantilla.replace("{{CUERPO}}", cuerpo)
        pagina = pagina.replace("{{ESQUEMA}}", esquema_preguntas(principal))
        pagina = pagina.replace("{{TITULO}}", datos["titulo"]).replace("{{DESCRIPCION}}", datos["descripcion"])
        # Solo se pide una foto si el archivo existe; si no, queda la inicial.
        pagina = re.sub(
            r' data-foto="([^"]+)"',
            lambda m: m.group(0) if (RAIZ / m.group(1)).exists() else "",
            pagina,
        )
        (RAIZ / archivo).write_text(firma + poner_datos(pagina), encoding="utf-8")

    archivos = sorted((RAIZ / "estilos").glob("*.css"))
    archivos += sorted((RAIZ / "estilos" / "movil").glob("*.css"))
    css = "\n".join(leer(p) for p in archivos)
    (RAIZ / "sitio.css").write_text(poner_datos(css), encoding="utf-8")

    js = "\n".join(leer(p) for p in sorted((RAIZ / "js").glob("*.js")))
    (RAIZ / "sitio.js").write_text(js, encoding="utf-8")
    print(f"Listo: {len(PAGINAS)} páginas.")


if __name__ == "__main__":
    main()
