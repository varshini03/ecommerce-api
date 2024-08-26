const Product = require('../models/product');

const getProducts = async(req, res) => {
    try{
        const prods = await Product.find({});
        res.status(200).json(prods);
    }
    catch(error){
        res.status(500).json({message : error.message});
    }
};

const getProduct = async(req, res) =>{
    try{
        const {id} = req.params;
        const prod = await Product.findById(id);
        if(!prod){
            return res.status(404).json({message : 'Product not found'})
        }
        res.status(200).json(prod);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

const addProduct = async (req, res) => {
    try{
        const prod = await Product.create(req.body);
        res.status(200).json(prod);
    }catch(error){
        res.status(500).json({message : error.message});
    };
};

const updateProduct = async(req, res) => {
    try{
        const {id} = req.params;
        const prod = await Product.findByIdAndUpdate(id, req.body);
        if(!prod){
            return res.status(404).json({message : "Product not found"});
        }else{
            const updatedProd = await Product.findById(id);
            res.status(200).json(updatedProd);
        }
    }catch(error){
        res.status(500).json({message : error.message});
    }
};

const deleteProduct = async(req, res) => {
    try{
        const {id} = req.params;
        const prod = await Product.findByIdAndDelete(id);
        if(!prod){
            return res.status(404).json({message : 'Product not found!'});
        }else{
            res.status(200).json({message : "product deleted successfully"});
        }
    }catch(error){
        res.status(500).json({message : error.message});
    }
};

module.exports = {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct
};