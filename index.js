const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt = require('./authJwt');
require('dotenv').config();

const Product = require('./models/product');
const Category = require('./models/category');
const app = express();
const ProductRoute = require('./routes/product.route');
const User = require('./models/user')
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// middleware
app.use(express.json());
app.use(authJwt());

// routes
app.use('/api/products', ProductRoute);

mongoose.connect('mongodb+srv://varsh:Varshi_leo%4004@backenddb.hrqrokx.mongodb.net/Node-API?retryWrites=true&w=majority&appName=BackendDB')
.then(()=>{
    console.log('connected to database!');
    app.listen(3000, () => {
        console.log('server is running on port 3000...');
    });
})
.catch(() => {
    console.log("connection failed!");
});

app.get('/', (req, res) =>{
    res.send('Hello from Node API');
});

app.post('/api/category', async(req,res) => {
    try{
        const cat = await Category.create(req.body);
        res.status(200).json(cat);
    }catch(error){
        res.status(500).json({message: error.message});
    }
});

// users
app.post('/api/user/register', async(req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if(!user){
        return res.status(404).json({message : "user couldnt be created"})
    }else{
        res.status(200).json(user);
    }
});

app.delete('/api/user/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'User deleted successfully' })
        } else {
            return res.status(404).json({ success: false, message: 'User cannot find' })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
});

app.post('/api/user/login', async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        const secret = process.env.SECRET;

        // Check if user exists
        if (!user) {
            return res.status(400).send('User with given Email not found');
        }

        // Verify password
        if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
            // Generate JWT token
            const token = jwt.sign({
                userID: user.id,
                isAdmin: user.isAdmin
            }, secret, { expiresIn: '1d' });

            // Send response with user email and token
            return res.status(200).send({ user: user.email, token: token });
        } else {
            // Password mismatch
            return res.status(400).send('Password mismatch');
        }
    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/api/user', async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.send(userList);
});

// orders
// View all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('orderItems');
        res.send(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
    }
});

// View a specific order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('orderItems');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.send(order);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve order' });
    }
});

// Place a new order
app.post('/api/orders', async (req, res) => {
    try {
        const orderItemIds = [];
        const errors = [];

        // Validate and create order items
        for (const item of req.body.orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                errors.push(`Product with ID ${item.product} does not exist.`);
                continue;
            }
            if (product.stock < item.quantity) {
                errors.push(`Insufficient stock for product with ID ${item.product}.`);
                continue;
            }

            const orderItem = new OrderItem({
                quantity: item.quantity,
                product: item.product
            });
            const savedOrderItem = await orderItem.save();
            orderItemIds.push(savedOrderItem._id);
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Calculate total price
        let totalPrice = 0;
        for (const id of orderItemIds) {
            const orderItem = await OrderItem.findById(id).populate('product');
            totalPrice += orderItem.product.price * orderItem.quantity;
        }

        // Create and save the order
        const order = new Order({
            orderItems: orderItemIds,
            area: req.body.area,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        const savedOrder = await order.save();
        res.send(savedOrder);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});