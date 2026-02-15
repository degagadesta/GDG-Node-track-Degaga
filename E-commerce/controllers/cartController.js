const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get current cart
// @route   GET /cart
// @access  Public
exports.getCart = async (req, res) => {
    try {
        // Find the cart (since no user auth, we'll get the first one or create empty)
        let cart = await Cart.findOne().populate("item.productId");
        
        // If no cart exists, return empty cart structure
        if (!cart) {
            return res.status(200).json({
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }
        
        // Calculate totals
        const totalItems = cart.item.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.item.reduce((sum, item) => {
            return sum + (item.productId.price * item.quantity);
        }, 0);
        
        res.status(200).json({
            cart,
            summary: {
                totalItems,
                totalPrice
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to fetch cart",
            message: error.message 
        });
    }
};

// @desc    Add item to cart
// @route   POST /cart
// @access  Public
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        // VALIDATION 1: Check if productId is provided
        if (!productId) {
            return res.status(400).json({ 
                error: "Product ID is required" 
            });
        }
        
        // VALIDATION 2: Check if product exists in database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                error: "Product not found" 
            });
        }
        
        // VALIDATION 3: Check if quantity is valid
        if (quantity <= 0) {
            return res.status(400).json({ 
                error: "Quantity must be at least 1" 
            });
        }
        
        // VALIDATION 4: Check if enough stock is available
        if (product.stock < quantity) {
            return res.status(400).json({ 
                error: `Insufficient stock. Only ${product.stock} available` 
            });
        }
        
        // Find existing cart or create new one
        let cart = await Cart.findOne();
        
        if (!cart) {
            // Create new cart if none exists
            cart = new Cart({
                item: [{ productId, quantity }]
            });
        } else {
            // Check if product already in cart
            const existingItemIndex = cart.item.findIndex(
                item => item.productId.toString() === productId
            );
            
            if (existingItemIndex > -1) {
                // Product exists in cart - update quantity
                const newQuantity = cart.item[existingItemIndex].quantity + quantity;
                
                // Check stock for updated quantity
                if (product.stock < newQuantity) {
                    return res.status(400).json({ 
                        error: `Cannot add ${quantity} more. Only ${product.stock - cart.item[existingItemIndex].quantity} additional items available` 
                    });
                }
                
                cart.item[existingItemIndex].quantity = newQuantity;
            } else {
                // Product not in cart - add new item
                cart.item.push({ productId, quantity });
            }
        }
        
        // Save cart to database
        await cart.save();
        
        // Populate product details for response
        await cart.populate("item.productId");
        
        // Calculate totals
        const totalItems = cart.item.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.item.reduce((sum, item) => {
            return sum + (item.productId.price * item.quantity);
        }, 0);
        
        res.status(201).json({
            message: "Item added to cart successfully",
            cart,
            summary: {
                totalItems,
                totalPrice
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to add item to cart",
            message: error.message 
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /cart
// @access  Public
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // VALIDATION 1: Check required fields
        if (!productId || quantity === undefined) {
            return res.status(400).json({ 
                error: "Product ID and quantity are required" 
            });
        }
        
        // VALIDATION 2: Check quantity is valid
        if (quantity < 0) {
            return res.status(400).json({ 
                error: "Quantity cannot be negative" 
            });
        }
        
        // Find cart
        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ 
                error: "Cart not found" 
            });
        }
        
        // If quantity is 0, remove item
        if (quantity === 0) {
            cart.item = cart.item.filter(
                item => item.productId.toString() !== productId
            );
        } else {
            // Find item in cart
            const itemIndex = cart.item.findIndex(
                item => item.productId.toString() === productId
            );
            
            if (itemIndex === -1) {
                return res.status(404).json({ 
                    error: "Item not found in cart" 
                });
            }
            
            // Check stock availability
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ 
                    error: "Product not found" 
                });
            }
            
            if (product.stock < quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock. Only ${product.stock} available` 
                });
            }
            
            // Update quantity
            cart.item[itemIndex].quantity = quantity;
        }
        
        // Save updated cart
        await cart.save();
        await cart.populate("item.productId");
        
        // Calculate totals
        const totalItems = cart.item.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.item.reduce((sum, item) => {
            return sum + (item.productId.price * item.quantity);
        }, 0);
        
        res.status(200).json({
            message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
            cart,
            summary: {
                totalItems,
                totalPrice
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to update cart",
            message: error.message 
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /cart/:productId
// @access  Public
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // VALIDATION: Check if productId is provided
        if (!productId) {
            return res.status(400).json({ 
                error: "Product ID is required" 
            });
        }
        
        // Find cart
        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).json({ 
                error: "Cart not found" 
            });
        }
        
        // Check if item exists in cart
        const itemExists = cart.item.some(
            item => item.productId.toString() === productId
        );
        
        if (!itemExists) {
            return res.status(404).json({ 
                error: "Item not found in cart" 
            });
        }
        
        // Remove item from cart
        cart.item = cart.item.filter(
            item => item.productId.toString() !== productId
        );
        
        // Save updated cart
        await cart.save();
        
        
        
        await cart.populate("item.productId");
        
        // Calculate totals
        const totalItems = cart.item.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.item.reduce((sum, item) => {
            return sum + (item.productId.price * item.quantity);
        }, 0);
        
        res.status(200).json({
            message: "Item removed from cart successfully",
            cart,
            summary: {
                totalItems,
                totalPrice
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to remove item from cart",
            message: error.message 
        });
    }
};

// @desc    Clear entire cart
// @route   DELETE /cart
// @access  Public
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne();
        
        if (!cart) {
            return res.status(404).json({ 
                error: "Cart not found" 
            });
        }
        
        // Clear all items
        cart.item = [];
        await cart.save();
        
        res.status(200).json({
            message: "Cart cleared successfully",
            cart: { items: [] }
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Failed to clear cart",
            message: error.message 
        });
    }
};