import express from 'express';
import {
    getBooks,
    searchBooks,
    getBookById,
    createBook,
    deleteBook
} from '../controllers/bookControllers.js';

const router = express.Router();

router.get('/search', searchBooks);  
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.delete('/:id', deleteBook);

export default router;
