import path from 'path'

import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))

// usuario fake en memoria
type Usuario = {
  password: string
  saldo: number
}

const USERS: Record<string, Usuario> = {
  fernando: {
    password: '1234',
    saldo: 100000,
  },
}

// vistas
app.get('/login', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/login.html'))
})

app.post('/login', (req, res) => {
  const { user, password } = req.body
  const found = USERS[user]

  if (!found || found.password !== password) {
    return res.status(401).send('Usuario o contraseña incorrectos')
  }

  res.cookie('session', user, {
    httpOnly: true,
    sameSite: 'none', // 'lax' es el valor por defecto
    // para 'none' es necesario el flag secure
    // secure: true,
  })

  res.redirect('/dashboard')
})

app.get('/dashboard', (req, res) => {
  const user = req.cookies.session

  if (!user || !USERS[user]) {
    return res.redirect('/login.html')
  }

  res.sendFile(path.join(process.cwd(), 'public/dashboard.html'))
})

const transferir = (req: express.Request, res: express.Response) => {
  const user = req.cookies.session
  if (!user || !USERS[user]) {
    return res.status(401).send('No autorizado')
  }

  USERS[user].saldo -= Number(req.body.monto || 0)
  res.send(`Transferencia realizada vía ${req.method} 💸`)
}

app.post('/transferir', transferir)
app.get('/transferir', transferir)

app.listen(3000, () =>
  console.log('🔥 Server vulnerable en http://localhost:3000'),
)
