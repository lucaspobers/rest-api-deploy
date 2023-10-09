const express = require('express');
const crypto = require('node:crypto');
const app = express();
const z = require('zod');

const { validateMovie, validatePartialMovie } = require('./schemas/validaciones')
const movies = require('./movies.json');

app.use(express.json());

app.disable('x-powered-by');

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.get('/movies', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    const {genre, tile} = req.query;

    if (genre) {
        // const filteredMovies = movies.filter(movie => movie.genre.includes(genre));
        const filteredMovies = movies.filter(movie => movie.genre.some(g = g.toLowerCase() === genre.toLowerCase())); // case insensitive
        return res.json(filteredMovies);
    }

    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    const { id } = req.params.id;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie);
    res.status(404).json({ message: 'Movie not found!' });
});


app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = {
        id: crypto.randomUUID(), // random id
        ...result.data,
    };

    movies.push(newMovie);

    res.status(201).json(newMovie); 
});

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    
    const  { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found!' });
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data,
    };

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// npm install zod -E - Para validar datos de entrada
// npm install node:crypto -E - Para generar un id random

/*
    Muchos hacen las validaciones en otro archivo. SOLUCION CORS min 48:00.

    Al hacerlo en otro archivo tambien puede usar las validaciones que usamos para el push
    en el patch, put, etc. (1:01:09) 

*/