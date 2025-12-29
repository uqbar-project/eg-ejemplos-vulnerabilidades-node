import { Comment } from '@shared/types.js'

const commentsListContainer = document.querySelector<HTMLDivElement>('#comments-list-container')!
const commentInputArea = document.querySelector<HTMLTextAreaElement>('#comment-input-area')!
const sendCommentButton = document.querySelector<HTMLButtonElement>('#send-comment-button')!

const loadComments = async (): Promise<void> => {
  const serverResponse = await fetch('http://localhost:3000/comments', {
    credentials: 'include',
  })
  const commentsList: Comment[] = await serverResponse.json()
  
  // Limpiamos solo el contenedor de la lista, no toda la app
  commentsListContainer.textContent = '' 

  const commentElements = commentsList.map((comment: Comment) => {
    const cardContainer = document.createElement('div')
    cardContainer.className = 'comment-card'

    const idLabel = document.createElement('p')
    idLabel.className = 'comment-id'
    idLabel.textContent = `Comentario ID: ${comment.id}`

    const textContentDiv = document.createElement('div')
    // DEFENSA: textContent trata el payload como texto literal
    textContentDiv.textContent = comment.text 

    cardContainer.appendChild(idLabel)
    cardContainer.appendChild(textContentDiv)
    
    return cardContainer
  })

  commentsListContainer.append(...commentElements)
}

const postNewComment = async (): Promise<void> => {
  const commentText = commentInputArea.value
  if (!commentText) return

  await fetch('http://localhost:3000/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: commentText }),
    credentials: 'include',
  })
  
  commentInputArea.value = ''
  await loadComments()
}

sendCommentButton.addEventListener('click', postNewComment)

// Carga inicial
loadComments()