import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/search', (request, response) => {
  const searchTerm = request.query.query || ''

  // Usamos un Template String limpio para el SSR
  response.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Banco Alas - Resultados</title>
            <style>
                body { 
                    font-family: 'Manrope', 'Segoe UI', Roboto, sans-serif; 
                    background: #f0f2f5; 
                    display: flex; 
                    justify-content: center; 
                    padding: 40px; 
                }
                .card { 
                    background: white; 
                    padding: 40px; 
                    border-radius: 12px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
                    width: 100%;
                    max-width: 500px;
                    border-top: 8px solid #1a5f7a; 
                }
                .logo { 
                    color: #1a5f7a; 
                    font-weight: bold; 
                    font-size: 2rem;
                    margin-bottom: 25px; 
                    text-align: center; 
                    letter-spacing: 2px;
                }
                .result-container {
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .search-term {
                    color: #d9534f;
                    font-weight: bold;
                }
                .back-link {
                    display: block;
                    margin-top: 30px;
                    text-align: center;
                    color: #1a5f7a;
                    text-decoration: none;
                    font-weight: 600;
                }
                /* Ocultamos la imagen del payload para que no se vea el icono de error */
                img { display: none; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">BANCO ALAS</div>
                <div class="result-container">
                    <p>Usted buscó: <span class="search-term">${searchTerm}</span></p>
                    <p>No se encontraron sucursales para su búsqueda.</p>
                </div>
                <a href="http://localhost:5173/search.html" class="back-link">← Volver al inicio</a>
            </div>
        </body>
        </html>
    `)
})

const port = 3001
app.listen(port, () => {
  console.log('🚀 XSS Reflected en puerto ' + port)
})