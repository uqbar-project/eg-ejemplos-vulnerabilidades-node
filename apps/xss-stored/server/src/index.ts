import express, { Request, Response, Application } from 'express'
import cors from 'cors'
import { Comment } from '@shared/types.js'

const serverApplication: Application = express()

// IMPORTANTE: Para que las cookies viajen en un entorno de diferentes puertos (5173 y 3000),
// necesitamos configurar CORS para permitir credenciales.
serverApplication.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

serverApplication.use(express.json())

const commentsDatabase: Comment[] = [
  { id: 1, text: 'A seguro se lo llevaron preso' },
]

serverApplication.get('/comments', (_request: Request, response: Response) => {
  // Seteamos una cookie de prueba. 
  // No le ponemos 'HttpOnly' porque sino el JavaScript no la puede leer (y queremos que sea vulnerable).
  response.cookie('sessionID', 'abc-123-unsam-secret', {
    maxAge: 900000,
    httpOnly: false, // Permitimos que JS la lea para la demo
    secure: false,   // No usamos https
    sameSite: 'lax',
    path: '/',
  })
  
  response.json(commentsDatabase)
})

serverApplication.post('/comments', (request: Request, response: Response) => {
  const { text } = request.body
  const newComment: Comment = { 
    id: Date.now(), 
    text: text,
  }
  
  // Vulnerabilidad: se guarda el string sin sanitizar
  commentsDatabase.push(newComment)
  response.status(201).json(newComment)
})

const serverPort = 3000

serverApplication.listen(serverPort, () => {
  console.log('📂 Ejemplo: XSS Stored (Persistente)')
  console.log(`🌐 Corriendo en: http://localhost:${serverPort}`)
  console.log('📝 Ingresa payloads XSS en el formulario para ver la vulnerabilidad en acción')
  console.log('💡 Ejemplo payload: [<img src="x" onerror="alert(document.cookie)">]')
})