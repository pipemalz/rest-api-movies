// Importación de módulos nativos
const crypto = require('node:crypto')

// Importación de dependencias
const express = require('express')
const cors = require('cors')

// Importación de constantes, datos JSON y funciones
const moviesJSON = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/moviesSchema') // Funcion para validar los datos que se envian a la API utilizando zod

// Definición de variables globales
const app = express() // Creación de la app con express.js
const PORT = 3000

app.disable('x-powered-by')

app.use(express.json()) // Middleware para manejar responses json https://www.npmjs.com/package/cors
app.use(cors({
  origin: (origin, callback) => {
    const ALLOWED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:5173'
    ]
    if (ALLOWED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})) // Middleware para cabeceras CORS, Por defecto asigna '*' a la cabecera Access-Control-Allow-Origin, por lo tanto si queremos limitarlo se mandamos un parametro con los origin permitidos

app.get('/', (request, response) => { // GET: Obtener un elemento / recurso del servidor
  response.status(200).send('<h1>Bienvenido</h1>')
})

// Todos los recursos para MOVIES se identifican con /movies a estas rutas se le denomina endpoint.
app.get('/movies', (request, response) => {
  // recuperamos el el genero enviado por query strings
  const { genre } = request.query

  if (genre) {
    const filteredByGenre = moviesJSON.filter(movie => {
      return movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
    })

    if (filteredByGenre.length > 0) {
      return response.status(200).json(filteredByGenre)
    }
    return response.status(404).send('Not Found')
  }

  response.status(200).json(moviesJSON)
})

app.get('/movies/:id', (request, response) => { // path-to-regexp
  const { id } = request.params
  const movie = moviesJSON.find(movie => movie.id === id)
  if (movie) {
    response.status(200).json(movie)
  } else {
    response.status(404).send('Not Found')
  }
})

// Crear una pelicula
app.post('/movies', (request, response) => { // POST: Crear un nuevo elemento/recurso en el servidor
  const result = validateMovie(request.body) // Validamos la informacion de acuerdo al schema creado con zod

  if (result.error) {
    return response.status(400).json({ error: JSON.parse(result.error.message) }) // Si hubo un error en la validacion respondemos con el error, y con el codigo 400 bad request, tambien podemos usar el codigo de error 422 Unprocessable Entity
  }

  // const { title, year, director, duration, genre } = request.body
  const id = crypto.randomUUID()

  const newMovie = {
    id,
    // title,
    // year,
    // director,
    // duration,
    // genre
    ...result.data // Si la validacion se da correctamente, en la propiedad .data se devuelve el clon de la informacion del request.body
  }
  moviesJSON.push(newMovie)

  response.status(201).json(moviesJSON)
})

// Actualizar una película
app.patch('/movies/:id', (request, response) => { // PATCH: Actualizar parcialmente un elemento/recurso en el servidor
  const result = validatePartialMovie(request.body)

  if (result.error) return response.status(400).json({ error: JSON.parse(result.error.message) })

  const { id } = request.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return response.status(404).send('Movie not found')

  const updateMovie = {
    ...moviesJSON[movieIndex],
    ...result.data
  }

  moviesJSON[movieIndex] = updateMovie

  response.status(201).json(updateMovie)
})

app.delete('/movies/:id', (request, response) => {
  const { id } = request.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return response.status(404).send('Movie not found')

  const [deleted] = moviesJSON.splice(movieIndex, 1)

  return response.status(200).send({ deleted })
})

// Metodos normales: GET/HEAD/POST <-- CORS
// Metodos complejos: PUT/PATCH/DELETE <-- CORS Pre-flight

// CORS Pre-flight --> OPTIONS --> Es una peticion previa que hace el navegador con el metodo OPTIONS antes de hacer la peticion PUT/PATCH/DELETE, por lo tanto tenemos que manejarla desde el backend:

app.options('/movies/:id', (request, response) => {
  response.sendStatus(200)
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
