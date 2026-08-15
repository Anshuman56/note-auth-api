# Note Auth API

You can register and log in to the API. After logging in, you can access the `/notes` endpoint. It's a multi-user API where users can register, log in, and create, update, and delete their own notes.

[Live Demo](https://note-api-1s7l.onrender.com/)

![Screenshot](001.png "Screenshot")

## Features

- Create and store notes for the logged-in user.
- View notes at the `/notes` endpoint.
- Update a note with `PUT /notes/:id`.
- Delete a note with `DELETE /notes/:id`.

## Tech Stack

Built with Express, JavaScript, Node.js, and Mongoose.

## What I Learned

I learned how multi-user authorization works and how to prevent unauthorized users from accessing other users' data.

## How to Run It Locally

```bash
git clone https://github.com/Anshuman56/note-auth-api
cd note-auth-api
npm install
node server.js
```
