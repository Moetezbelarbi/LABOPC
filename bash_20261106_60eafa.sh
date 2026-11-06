cd icons/
convert -background none icon-source.svg -resize 192x192 icon-192.png
convert -background none icon-source.svg -resize 512x512 icon-512.png
convert -background none icon-source.svg -resize 410x410 -gravity center \
        -extent 512x512 -background "#0f2027" icon-maskable-512.png
convert -background none icon-source.svg -resize 180x180 apple-touch-icon.png