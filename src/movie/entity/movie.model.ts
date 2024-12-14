import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity.js';
import { Comment } from './comment.model.js';

@Entity('tb_movie')
export class Movie extends BaseEntity {
    @Column()
    title?: string;

    @Column()
    description?: string;

    @Column()
    releaseDate?: Date;

    @OneToMany(() => Comment, (comment) => comment.movie, { cascade: true })
    comments?: Relation<Comment[]>;
}
