import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Song extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  videoUrl: string

  @Column()
  title: string

  @Column()
  author: string

  @Column()
  cover: string
}

export interface SongInterface {
  id?: number
  videoUrl: string
  title?: string
  author?: string
  cover?: string
}
