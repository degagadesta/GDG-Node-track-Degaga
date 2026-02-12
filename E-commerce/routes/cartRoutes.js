import express from "express"

import {
    getCart,
    addItem,
    updateItem,
    deleteItem
}from "../controllers/cartController.js";

const router= express.Router();

router.get('/',getCart);

router.post('/',addItem);

router.put('/:id',updateItem);

router.delete('/:id',deleteItem);

export default router