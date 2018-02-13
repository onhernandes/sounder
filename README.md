# SoundMan - YouTube Downloader API

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Download YouTube videos as MP3, setting metadata like artist, album, cover and more!

Use:
- NodeJS
- Express + Mongoose
- ytdl-core
- fluent-ffmpeg
- ffmetadata

Data is sent to MongoDB then is stored as pending downloads. You can use the files in cli/ to execute mass operations like downloading and sending to Spotify.

-----------

## How to Use

You could just import our [Postman's Collection](Soundman.collection.json) and try right now!

### POST - Add new music

The following fields defaults to what YT can give to us: `cover`, `author`, `title`
Every music will be sent to a Spotify playlist, if not defined, will be added to `Soundman`. You can set `"spotify": false` to avoid this. This feature depends on the song being found within Spotify!

Endpoint: `/api/music`

```json
{
	"url": "string",
	"cover": "string",
	"author": "string",
	"album": "string",
	"title": "string",
	"playlist": "string",
	"spotify": "bool",
}
```

#### RESPONSE

```js
{
	status: 'created, will be downloaded soon'
}
```

#### ERROR

In case of providing wrong fields

```js
{
	error: 'must have at least url parameter'
}
```

### GET - Search or get a specific music

Endpoint: `/api/music/:video_id?`

You can just pass the `video_id` for getting a music or you can use the following parameters for searching, the json is just for pretty view, but you must pass it as `?title=My+awesome+Music&author=Blackbear`

```json
{
	"title": "string",
	"author": "string",
	"url": "string",
	"album": "string",
	"video_id": "string"
}
```

#### RESPONSE

```json
[
  {
    "title": "string",
    "video_id": "string",
    "url": "string",
    "album": "string",
    "author": "string",
    "cover": "string",
    "status": "string",
	"playlist": "string",
	"spotify": "bool",
	"spotify_status": "string",
	"spotify_uri": "string",
	"tries": "integer",
	"status": "string",
	"file_name": "string"
  }
]
```


#### Error or Not Found

Just returns an empty array.

```json
[]
```

### PUT - Update a music

Endpoint: `/api/music/:video_id`

```json
{
	"title": "string",
	"cover": "string",
	"album": "string",
	"author": "string",
	"playlist": "string",
	"spotify": "bool",
	"update": "bool"
}
```

#### RESPONSE

```json
{
	"title": "string",
	"video_id": "string",
	"url": "string",
	"album": "string",
	"author": "string",
	"cover": "string",
	"status": "string",
	"playlist": "string",
	"spotify": "bool",
}
```

#### ERROR

```json
{
	"error": "not found"
}
```

### DELETE - Delete a music(the file and the record)

Endpoint: `/api/music/:video_id`

#### RESPONSE

```json
{
	"status": "string",
	"title": "string",
	"url": "string"
}
```

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