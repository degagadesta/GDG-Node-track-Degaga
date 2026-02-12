import express from "express"

import {
    getAllOrders,
    getOrderById,
    createOrder,
}from '../controllers/orderController.js';

const router= express.Routes();

routes.get('/', getAllOrders);

routes.get('/:id',getOrderById);

routes.post('/',createOrder);

export default routes