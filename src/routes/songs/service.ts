import { Song } from '../../db/Song'
import ytdl from 'ytdl-core'

export default {
  async create (data: { videoUrl: string }): Promise<boolean> {
    const validUrl: boolean = ytdl.validateURL(data.videoUrl)
    return validUrl
  }
}
