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

# Orden de la página. Para mover una sección, mueve su nombre.
SECCIONES = [
    "nav", "hero", "problema", "llamada", "voces", "dia", "giros", "planes", "proceso",
    "servicios", "whatsapp", "web", "creativos", "portafolio", "resenas", "raul", "preguntas", "cierre", "contacto", "pie",
    "movil-barra", "agente",
]


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


def main():
    cuerpo = "\n".join(leer(RAIZ / "secciones" / f"{n}.html") for n in SECCIONES)
    plantilla = leer(RAIZ / "plantilla.html")
    pagina = plantilla.replace("{{CUERPO}}", cuerpo)
    pagina = pagina.replace("{{ESQUEMA}}", esquema_preguntas(cuerpo))
    # Solo se pide una foto si el archivo existe; si no, queda la inicial.
    pagina = re.sub(
        r' data-foto="([^"]+)"',
        lambda m: m.group(0) if (RAIZ / m.group(1)).exists() else "",
        pagina,
    )
    firma = (RAIZ / "plantilla.html").read_text(encoding="utf-8").split("-->")[0] + "-->\n"
    (RAIZ / "index.html").write_text(firma + poner_datos(pagina), encoding="utf-8")

    archivos = sorted((RAIZ / "estilos").glob("*.css"))
    archivos += sorted((RAIZ / "estilos" / "movil").glob("*.css"))
    css = "\n".join(leer(p) for p in archivos)
    (RAIZ / "sitio.css").write_text(poner_datos(css), encoding="utf-8")

    js = "\n".join(leer(p) for p in sorted((RAIZ / "js").glob("*.js")))
    (RAIZ / "sitio.js").write_text(js, encoding="utf-8")
    print(f"Listo: {len(SECCIONES)} secciones unidas.")


if __name__ == "__main__":
    main()
