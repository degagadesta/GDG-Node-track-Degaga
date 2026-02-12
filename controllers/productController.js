import { findById } from "../models/Order";
import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;

    let query = {};

    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById= async (req, res)=> {
    try{
        const product = await Product.findById(req.params.id)

        if(!product) return res.status(404).json({message : "Product not found"});
        res.json(product)
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};