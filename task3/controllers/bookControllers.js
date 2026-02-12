import { bookSchema } from '../utils/validate.js';

let books = [
    { id: 1, title: "Clean Code", author: "Robert", price: 25 },
    { id: 2, title: "JavaScript Guide", author: "Mozilla", price: 0 }
];

export const getBooks = (req, res) => {
    res.status(200).json(books);
};

export const searchBooks = (req, res) => {
    res.send("You are on the search page");
};

export const getBookById = (req, res, next) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book)
        return res.status(404).json({ error: "Book not found" });

    res.status(200).json(book);
};

export const createBook = (req, res) => {
    const { error } = bookSchema.validate(req.body);

    if (error)
        return res.status(400).json({ error: error.details[0].message });

    const newBook = {
        id: books.length + 1,
        ...req.body
    };

    books.push(newBook);
    res.status(201).json(newBook);
};

export const deleteBook = (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1)
        return res.status(404).json({ error: "Book not found" });

    books.splice(index, 1);
    res.status(200).json({ message: "Book deleted successfully" });
};
