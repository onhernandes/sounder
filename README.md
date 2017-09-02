# SoundMan - YouTube Downloader API

Download YouTube videos as MP3, setting metadata like artist, album, cover and more!

Use:
- NodeJS
- Express + Mongoose
- ytdl-core
- fluent-ffmpeg
- ffmetadata

Data is sent to MongoDB then is stored as pending downloads. The api itself check for pending downloads and starts new ones if needed each 5 minutes. Simple.

-----------

## How to Use

### POST

```js
{
	url: 'MUSIC-VIDEO-URL',
	cover: 'COVER-URL', // defaults to ''
	author: 'AUTHOR NAME', // defaults to ''
	album: 'ALBUM NAME', // defaults to ''
	title: 'MUSIC TITLE' // defaults to YT provided title or MongoDB _id
}
```

### RESPONSE

```js
{
	status: 'created, will be downloaded soon'
}
```

### ERROR

In case of providing wrong fields

```js
{
	error: 'must have at leats url parameter'
}
```

For more, check out log folder


# LICENSE

Copyright (c) 2017

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.