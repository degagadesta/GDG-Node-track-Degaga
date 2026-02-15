const express = require("express");

const {
    getCart,
    addItem,
    updateItem,
    deleteItem
} = require("../controllers/cartController.js");

const router = express.Router();

router.get('/', getCart);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
