# SoundMan - YouTube Downloader API

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Download YouTube videos as MP3, setting metadata like artist, album, cover and more!

Use:
- NodeJS
- Express + Mongoose
- ytdl-core
- fluent-ffmpeg
- ffmetadata

Data is sent to MongoDB then is stored as pending downloads. You can use the files in cli/ to download.

-----------

## How to Use

You could just import our [Postman's Collection](Soundman.collection.json) and try right now!

## Downloading

To download songs, you just need to run `npm run downloader`. The songs will be downloaded to `$HOME/soundman/`

### POST - Add new music

The following fields defaults to what YT can give to us: `cover`, `author`, `title`

Endpoint: `/api/music`

```json
{
	"url": "string - required",
	"cover": "string",
	"author": "string",
	"album": "string",
	"title": "string"
}
```

#### RESPONSE

```js
[
  {
    "status": "pending",
    "_id": "",
    "url": "",
    "video_id": ""
  }
]
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
    "status": "string"
  }
]
```

### PUT - Update a music

Endpoint: `/api/music/:video_id`

```json
{
	"title": "string",
	"cover": "string",
	"album": "string",
	"author": "string"
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
	"status": "string"
}
```

### DELETE - Delete a music(the file and the record)

Endpoint: `/api/music/:video_id`

#### RESPONSE

```json
{
	"title": "string",
	"video_id": "string",
	"url": "string",
	"album": "string",
	"author": "string",
	"cover": "string",
	"status": "string"
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
