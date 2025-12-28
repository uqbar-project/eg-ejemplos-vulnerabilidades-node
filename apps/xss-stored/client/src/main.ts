import { Comment } from '@shared/types.js'

const app = document.querySelector<HTMLDivElement>('#app')!

const loadComments = async () => {
  const response = await fetch('http://localhost:3000/comments', {
    credentials: 'include', 
  })
  const comments = await response.json()
  
  const html = comments.map((comment: Comment) => `
    <div class="comment">
      <p>Comentario ID: ${comment.id}</p>
      <div>${comment.text}</div>
      <hr>
    </div>
  `).join('')

  // EL ERROR: Usar innerHTML ejecuta los payloads inyectados
  app.innerHTML = `
    <h1>Libro de Visitas (PHM)</h1>
    <div id="list">${html}</div>
    <textarea id="msg" placeholder="Escribí algo..."></textarea>
    <button id="send">Enviar</button>
  `

  document.querySelector('#send')?.addEventListener('click', postComment)
}

const postComment = async () => {
  const text = (document.querySelector('#msg') as HTMLTextAreaElement).value
  await fetch('http://localhost:3000/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    credentials: 'include',  // recibimos y mandamos cookies
  })
  loadComments()
}

loadComments()