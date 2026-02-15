const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Create new order from cart
// @route   POST /orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { customer } = req.body;
        
        // VALIDATION 1: Check if customer info is provided
        if (!customer || !customer.name || !customer.email || !customer.address) {
            return res.status(400).json({ 
                error: "Customer information (name, email, address) is required" 
            });
        }
        
        // VALIDATION 2: Get current cart
        const cart = await Cart.findOne().populate("item.productId");
        
        if (!cart || cart.item.length === 0) {
            return res.status(400).json({ 
                error: "Cart is empty. Add items before placing order." 
            });
        }
        
        // VALIDATION 3: Check stock availability for all items
        const outOfStockItems = [];
        const orderItems = [];
        let totalAmount = 0;
        
        for (const cartItem of cart.item) {
            const product = cartItem.productId;
            
            // Check if product still exists
            if (!product) {
                outOfStockItems.push({
                    productId: cartItem.productId,
                    reason: "Product no longer exists"
                });
                continue;
            }
            
            // Check stock availability
            if (product.stock < cartItem.quantity) {
                outOfStockItems.push({
                    productId: product._id,
                    name: product.name,
                    requested: cartItem.quantity,
                    available: product.stock,
                    reason: "Insufficient stock"
                });
                continue;
            }
            
            // Calculate item total and add to order items
            const itemTotal = product.price * cartItem.quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                productID: product._id,
                quantity: cartItem.quantity,
                price: product.price
            });
        }
        
        // If any items are out of stock, don't proceed with order
        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                error: "Some items are out of stock",
                outOfStockItems
            });
        }
        
        // Create new order
        const order = new Order({
            items: orderItems,
            totalAmount,
            customer: {
                name: customer.name,
                email: customer.email,
                address: customer.address
            }
        });
        
        // Save order to database
        await order.save();
        
        // Update product stock (reduce quantities)
        for (const cartItem of cart.item) {
            const product = cartItem.productId;
            product.stock -= cartItem.quantity;
            await product.save();
        }
        
        // Clear the cart after successful order
        cart.item = [];
        await cart.save();
        
        // Populate product details for response
        await order.populate("items.productID");
        
        // Generate receipt
        const receipt = {
            orderId: order._id,
            orderDate: order.createdAt,
            customer: order.customer,
            items: order.items.map(item => ({
                product: item.productID.name,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.price * item.quantity
            })),
            totalAmount: order.totalAmount,
            status: "confirmed"
        };
        
        res.status(201).json({
            message: "Order placed successfully",
            order,
            receipt
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to create order",
            message: error.message 
        });
    }
};

// @desc    Get all orders
// @route   GET /orders
// @access  Public
exports.getAllOrders = async (req, res) => {
    try {
        // Fetch all orders, sorted by newest first
        const orders = await Order.find()
            .populate("items.productID")
            .sort({ createdAt: -1 });
        
        // Add summary for each order
        const ordersWithSummary = orders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return {
                ...order.toObject(),
                summary: {
                    totalItems: itemCount,
                    customerName: order.customer.name
                }
            };
        });
        
        res.status(200).json({
            count: orders.length,
            orders: ordersWithSummary
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to fetch orders",
            message: error.message 
        });
    }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
// @access  Public
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                error: "Invalid order ID format" 
            });
        }
        
        const order = await Order.findById(id).populate("items.productID");
        
        if (!order) {
            return res.status(404).json({ 
                error: "Order not found" 
            });
        }
        
        // Calculate item count for summary
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        res.status(200).json({
            order,
            summary: {
                totalItems: itemCount,
                orderDate: order.createdAt,
                customer: order.customer.name
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to fetch order",
            message: error.message 
        });
    }
};

// @desc    Get orders by customer email
// @route   GET /orders/customer/:email
// @access  Public
exports.getOrdersByCustomerEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ 
                error: "Email is required" 
            });
        }
        
        const orders = await Order.find({ "customer.email": email })
            .populate("items.productID")
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            count: orders.length,
            orders
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to fetch customer orders",
            message: error.message 
        });
    }
};

// @desc    Update order status (bonus feature)
// @route   PATCH /orders/:id/status
// @access  Public
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Status must be one of: ${validStatuses.join(", ")}` 
            });
        }
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ 
                error: "Order not found" 
            });
        }
        
        // If cancelling order, restore stock
        if (status === "cancelled" && order.status !== "cancelled") {
            for (const item of order.items) {
                const product = await Product.findById(item.productID);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }
        
        order.status = status;
        await order.save();
        
        res.status(200).json({
            message: `Order status updated to ${status}`,
            order
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to update order status",
            message: error.message 
        });
    }
};

// @desc    Delete order (admin only - bonus)
// @route   DELETE /orders/:id
// @access  Public
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ 
                error: "Order not found" 
            });
        }
        
        // Restore stock if order is being deleted
        for (const item of order.items) {
            const product = await Product.findById(item.productID);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        
        await Order.findByIdAndDelete(id);
        
        res.status(200).json({
            message: "Order deleted successfully and stock restored"
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to delete order",
            message: error.message 
        });
    }
};
