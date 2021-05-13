import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

//  import goldenGlobesData from './data/golden-globes.json'
// import avocadoSalesData from './data/avocado-sales.json'
import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:

const bookSchema = new mongoose.Schema({
  bookID: Number,
  title: String, 
  authors: String,
  average_rating: Number,
  isbn: String, 
  isbn13: String,
  language_code: String,
  num_pages: Number,
  ratings_count: Number,
  text_reviews_count: Number
})

const Book = mongoose.model('Book', bookSchema)

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
    await Book.deleteMany()

    booksData.forEach((bookData) => {
      new Book(bookData).save()
    })
  }
  seedDatabase()
}

//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express() 

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Endpoints: /books, /books?title=titanic, /books?languages_code=eng, /books/isbn/076790818X, /books/id/609bcffa120fc13f88868db7')
})

// All books
// http://localhost:8080/books 
// Find title or language
// http://localhost:8080/books?title=titanic
// http://localhost:8080/books?languages_code=eng
app.get('/books', async (req, res) => {
  // eslint-disable-next-line camelcase
  const { title, language_code } = req.query

  if (title) {
    const bookInfo = await Book.find({
      title: {
        $regex: new RegExp(title, 'i')
      }    
    })
    res.json(bookInfo)
  }

  // eslint-disable-next-line camelcase
  if (language_code) {
    const bookInfo = await Book.find({
      language_code: {
        $regex: new RegExp(language_code, 'i')
      }
    })
    res.json(bookInfo)
  }
  const booksInfo = await Book.find()
  res.json(booksInfo)
})

// Show book after isbn nr
// http://localhost:8080/books/isbn/076790818X
app.get("/books/isbn/:isbn", async (req, res) => {
  const { isbn } = req.params
  const book = await Book.findOne({ isbn })

  if (book) {
    res.json(book)
  } else {
    res.status(404).json({ error: `Book with ISBN nr ${isbn} not found` })
  }
})

// Show book after id nr
// http://localhost:8080/books/id/609bcffa120fc13f88868db7
app.get('/books/id/:id', async (req, res) => {
  const { id } = req.params

  try {
    const bookId = await Book.findById(id)
    res.json(bookId)
  } catch {
    res.status(400).json({ error: `Book with id nr ${id} not found` })
  }
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})