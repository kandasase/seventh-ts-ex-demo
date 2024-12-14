import { MovieRepository } from '../repository/movie.repository.js';
import { CommentRepository } from '../repository/comment.repository.js';
// import { CommentRepository } from '../repository/comment.repository.js';
import { Movie } from '../entity/movie.model.js';
import { Comment } from '../entity/comment.model.js';
import { MovieRequest } from '../payload/request/movie.request.js';
import { CommentRequest } from '../payload/request/comment.request.js';
import { AppDataSource } from '../../data-source.js';

export class MovieService {
    async saveMovie(movie: MovieRequest) {
        const newMovie = new Movie();
        newMovie.title = movie.title;
        newMovie.description = movie.description;
        newMovie.releaseDate = movie.releaseDate;
        return MovieRepository.save(newMovie);
    }

    async updateMovie(id: string, movie: MovieRequest) {
        const newMovie = new Movie();
        newMovie.title = movie.title;
        newMovie.description = movie.description;
        newMovie.releaseDate = movie.releaseDate;
        return MovieRepository.update(id, newMovie);
    }

    async getMovies() {
        return MovieRepository.find({
            relations: ['comments'],
        });
    }
    async getMovieById(id: string) {
        return MovieRepository.findOne({
            where: { id: id },
            relations: ['comments'],
        });
    }
    async deleteMovie(id: string) {
        await MovieRepository.delete(id);
    }

    // comment
    async addComment(movie_id: string, request: CommentRequest) {
        const movie = await MovieRepository.findOneBy({
            id: movie_id,
        });
        if (!movie) {
            throw new Error('Movie not found');
        }
        const comment = new Comment();
        comment.content = request.content;
        comment.rating = request.rate;
        comment.movie = movie;
        return CommentRepository.save(comment);
    }

    async getCommentById(comment_id: string) {
        return CommentRepository.findOneBy({
            id: comment_id,
        });
    }

    async updateComment(comment_id: string, request: CommentRequest) {
        const comment = await CommentRepository.findOneBy({
            id: comment_id,
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        comment.content = request.content;
        comment.rating = request.rate;
        return CommentRepository.update(comment_id, comment);
    }

    async deleteComment(comment_id: string) {
        await CommentRepository.delete(comment_id);
    }

    // advance command
    async getAvgRatingByMovieId(movie_id: string) {
        const result = await CommentRepository.createQueryBuilder('comment').select('ROUND(AVG(comment.rating), 2)', 'avg_rating').where('comment.movie_id = :movie_id', { movie_id }).getRawOne();
        return result.avg_rating || 0;
    }

    async getTotalCommentFromEachMovie() {
        const result = await MovieRepository.createQueryBuilder('movie').leftJoin(Comment, 'comment', 'comment.movie_id = movie.id').select('movie.id', 'movie_id').addSelect('movie.title', 'movie_title').addSelect('COUNT(comment.id)', 'total_comments').groupBy('movie.id').addGroupBy('movie.title').getRawMany();
        return result;
    }

    async getMoviesWithRatingsAndGrades(): Promise<
        {
            movie_id: string;
            movie_title: string;
            movie_rating: number;
            grade: string;
        }[]
    > {
        const result = await AppDataSource.query(`
        WITH MovieRatings AS (
            SELECT
                tm.id AS movie_id,
                tm.title AS movie_title,
                COALESCE(ROUND(AVG(tc.rating), 2), 0) AS movie_rating
            FROM
                tb_movie tm
            LEFT JOIN
                tb_comment tc ON tm.id = tc.movie_id
            GROUP BY
                tm.id, tm.title
        )
        SELECT
            movie_id,
            movie_title,
            movie_rating,
            CASE 
                WHEN movie_rating >= 4.1 AND movie_rating <= 5 THEN 'Great'
                WHEN movie_rating >= 3 AND movie_rating < 4.1 THEN 'Good'
                WHEN movie_rating >= 2 AND movie_rating < 3 THEN 'Average'
                WHEN movie_rating >= 1 AND movie_rating < 2 THEN 'Poor'
                ELSE 'No Rating'
            END AS grade
        FROM
            MovieRatings;
    `);

        return result;
    }
}
