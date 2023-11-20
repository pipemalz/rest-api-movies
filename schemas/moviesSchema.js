const z = require('zod') // zod es una dependencia que nos permite crear validaciones para los datos que se recibe y procesa la API

const allowedGenres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']

// Creamos el esquema, el cual representará los tipos de datos y las caracteristicas que deben cumplir para ser validados a través de los métodos que nos ofrece la dependencia zod
const moviesSchema = z.object({
  title: z.string({ // El titulo debe ser string
    invalid_type_error: 'Movie title must be a string', // Si no es un string, podemos utilizar el atributo invalid_type_error para mandarle un error personalizado
    required_error: 'Movie title is required' // Si no se envia el titulo
  }).default('Untitled'), // Default hace que un valor sea opcional y se le da un valor por defecto en caso de que no se mande
  year: z.number().int().min(1900).max(2024), // El año debe ser un número entero entre 1900 y 2024, zod nos permite encadenar las validaciones de esta forma
  director: z.string().max(50, { message: 'Director name must be 50 or fewer characters long' }),
  duration: z.number().int().positive(), // Duracion debe ser un numero en tero
  rate: z.number().min(0).max(10), // Rate debe ser un numero entre 1 y 10, no importa si es decimal
  poster: z.string().url().optional(), // El poster debe ser una url que lleve a una imagen, este valor es opcional.
  genre: z.array(z.enum(allowedGenres), { required_error: 'Movie genre is required' }) // Los generos deben ser un array, solo pueden incluir los generos contenidos en el array allowedGenres, esto tambien se puede hacer con la declaracion z.enum(allowedGenres).array() que es equivalente
})

function validateMovie (input) { // Crear funcion para las validaciones de acuerdo al schema creado, le pasamos el objeto a validar como parametro
  return moviesSchema.safeParse(input) // El metodo safeParse valida el objeto, se puede utilizar .parse() que devuelve el clon del objeto si se valida correctamente, sino lanza un throw error, .safeParse() devuelve objeto Resolve con el resultado de la validacion sin lanzar throw error.
}

function validatePartialMovie (input) { // Crear funcion para validar datos parciales, se suele usar cuando se va a actualizar solo una parte del recurso, en este caso por ejemplo solo queremos actualizar el titulo de una pelicula que ya existe, entonces no tenemos que pasar todos los demas datos otra vez.
  return moviesSchema.partial().safeParse(input) // Para realizarl la validacion parcial usamos el metodo partial y entonces el metodo para entregar la validacion. Esto hara que los datos se vuelvan opcionales, pero los que se pasan para actualizar sean validados en su respectiva forma.
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
