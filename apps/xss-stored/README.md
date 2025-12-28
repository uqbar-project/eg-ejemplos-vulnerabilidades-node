
# Ejemplo XSS Stored

## Análisis

Este ejemplo demuestra una vulnerabilidad XSS Stored donde los comentarios se almacenan en la base de datos y se muestran sin sanitización, permitiendo la ejecución de scripts maliciosos.

La vulnerabilidad ocurre porque el contenido del comentario se inserta directamente en el DOM usando `innerHTML`, lo que permite que cualquier HTML o JavaScript incluido en el comentario sea ejecutado por el navegador del usuario.

## Levantando el server

pnpm --filter @vulnerabilities/xss-stored-server dev

## Levantando el cliente

```
pnpm --filter @vulnerabilities/xss-stored-client dev
```
## Fozando la vulnerabilidad

Si escribimos en el text area el siguiente payload:

```html
<img src="x" onerror="alert('Sesión robada: ' + document.cookie); console.log('XSS Ejecutado')">
```

Otra graciosa puede ser:

```html
<img src="x" onerror="document.getElementById('send').style.display = 'none'">
```

## BONUS: definiciones compartidas

La interface `Comment` está en un directorio shared, compartido entre cliente y servidor. Eso permite no tener que definir la misma interfaz en ambos lados.
