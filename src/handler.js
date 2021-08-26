const books = require('./books')
const { nanoid } = require('nanoid')

// Add Book Handler
const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

  const id = nanoid(16)
  const finished = pageCount === readPage
  const insertedAt = new Date().toISOString()
  const updatedAt = insertedAt

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
  }

  books.push(newBook)

  const isSuccess = books.filter((book) => book.id === id).length > 0

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    })
    response.code(201)
    return response
  }

  const response = h.response({
    status: 'error',
    message: 'Catatan gagal ditambahkan'
  })
  response.code(500)
  return response
}

// Get All Books Handler
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query

  if (name !== undefined) {
    if (reading !== undefined) {
      if (finished !== undefined) {
        // Jika client mengirim request query name, reading dan finished
        return {
          status: 'success',
          data: {
            books: books.filter((n) =>
              n.name.toLowerCase().includes(name.toLowerCase()) &&
              n.reading === (reading === '1') &&
              n.finished === (finished === '1')
            ).map((n) => ({
              id: n.id,
              name: n.name,
              publisher: n.publisher
            }))
          }
        }
      } else {
        return {
          // Jika client hanya mengirim request query name dan reading
          status: 'success',
          data: {
            books: books.filter((n) =>
              n.name.toLowerCase().includes(name.toLowerCase()) &&
              n.reading === (reading === '1')
            ).map((n) => ({
              id: n.id,
              name: n.name,
              publisher: n.publisher
            }))
          }
        }
      }
    } else if (finished !== undefined) {
      // Jika client hanya mengirim request query name dan finished
      return {
        status: 'success',
        data: {
          books: books.filter((n) =>
            n.name.toLowerCase().includes(name.toLowerCase()) &&
            n.finished === (finished === '1')
          ).map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher
          }))
        }
      }
    } else {
      // Jika client hanya mengirim request query name
      return {
        status: 'success',
        data: {
          books: books.filter((n) =>
            n.name.toLowerCase().includes(name.toLowerCase())
          ).map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher
          }))
        }
      }
    }
  }

  if (reading !== undefined) {
    if (finished !== undefined) {
      // Jika client hanya mengirim request query reading dan finished
      return {
        status: 'success',
        data: {
          books: books.filter((n) =>
            n.reading === (reading === '1') &&
            n.finished === (finished === '1')
          ).map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher
          }))
        }
      }
    } else {
      // Jika client hanya mengirim request reading
      return {
        status: 'success',
        data: {
          books: books.filter((n) =>
            n.reading === (reading === '1')
          ).map((n) => ({
            id: n.id,
            name: n.name,
            publisher: n.publisher
          }))
        }
      }
    }
  }

  if (finished !== undefined) {
    // Jika client hanya mengirim request query finished
    return {
      status: 'success',
      data: {
        books: books.filter((n) =>
          n.finished === (finished === '1')
        ).map((n) => ({
          id: n.id,
          name: n.name,
          publisher: n.publisher
        }))
      }
    }
  }

  // Jika client tidak mengirim request query, response menampilkan semua data buku
  return {
    status: 'success',
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
      }))
    }
  }
}

// Get Book By ID Handler
const getBookByIdHandler = (request, h) => {
  const { id } = request.params

  const book = books.filter((n) => n.id === id)[0]

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book
      }
    }
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  })
  response.code(404)
  return response
}

// Edit Book By ID Handler
const editBookByIdHandler = (request, h) => {
  const { id } = request.params

  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

  const finished = pageCount === readPage
  const updatedAt = new Date().toISOString()

  const index = books.findIndex((book) => book.id === id)

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt
    }

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui'
    })
    response.code(200)
    return response
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

// Delete Book By ID Handler
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params

  const index = books.findIndex((book) => book.id === id)

  if (index !== -1) {
    books.splice(index, 1)
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    })
    response.code(200)
    return response
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler
}
