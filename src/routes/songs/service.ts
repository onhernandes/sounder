import { Song, SongInterface } from '../../db/Song'
import ytdl from 'ytdl-core'
import InvalidProperty from '../../errors/InvalidProperty'

export default {
  async create (data: SongInterface): Promise<Song> {
    const validUrl: boolean = ytdl.validateURL(data.videoUrl)

    if (!validUrl) {
      throw new InvalidProperty('videoUrl')
    }

    const song = new Song()
    song.videoUrl = data.videoUrl
    song.title = data.title
    song.author = data.author
    song.cover = data.cover
    await song.save()

    return song
  }
}
