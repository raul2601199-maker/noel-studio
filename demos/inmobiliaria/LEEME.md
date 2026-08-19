# Demo · Sitio para inmobiliaria de terrenos

Muestra de Noel Studio para vender sitios a inmobiliarias que venden lotes
con financiamiento propio.

## Todo es ficticio
Asesor, desarrollos, precios y ubicaciones son inventados. El WhatsApp que
lleva es el de Noel Studio (614 225 1419), para que quien la pruebe escriba
directo contigo.

## Qué enseña
- Catálogo que se arma solo desde `terrenos.json` (cambiar un precio = editar una línea)
- Filtro por **mensualidad** o por contado, que es como piensa el comprador
- Mapa real con un alfiler por desarrollo
- Ficha con selector de plazo que calcula la mensualidad al momento
- Liga propia por terreno, para mandarla por WhatsApp
- Botón de WhatsApp con el mensaje ya escrito según el terreno
- Diseño con lenguaje de plano: mojoneras, cotas, coordenadas y folio de lote

## Cómo verla
Necesita servidor local porque el catálogo va en archivo aparte:

    cd "$(dirname "$0")"
    python3 -m http.server 8080

Luego abrir http://localhost:8080

## Para adaptarla a un cliente
1. Editar `terrenos.json`: asesor, WhatsApp y los desarrollos
2. Poner fotos en `img/` y apuntarlas en el campo `imagen`
3. Cambiar las coordenadas `lat` y `lon` por las reales del cliente
