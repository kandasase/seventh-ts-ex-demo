import { AppDataSource } from './data-source.js';
import { MovieReloadData } from './config/reload.movie.js';
import express, { urlencoded, json } from 'express';
import morgan from 'morgan';
import cors from 'cors'

// feature
import movieRouter from './movie/router/movie.router.js';

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';
const app = express();
const movieReloadData = new MovieReloadData();

app.use(cors())
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan(':date[iso] | :method | :url | :status | :res[content-length] - :response-time ms'));

// default route
app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// movie route
app.use('/api/v1/movie', movieRouter);

AppDataSource.initialize()
    .then(async () => {
        console.log('Database connected');
        await movieReloadData.loadData();
        app.listen(PORT, () => {
            console.log(`Server running at http://${HOST}:${PORT}`);
        });
    })
    .catch((error) => console.log(error));
