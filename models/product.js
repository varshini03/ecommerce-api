const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
        },
        image : {
            type : String,
            required : false,
            default : '',
        },
        price : {
            type : Number,
            required : true,
        },
        category : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Category',
            required : true,
        },
        countInStock : {
            type : Number,
            required : true,
        }
    },
    {
        timestamps : true,
    }
);

ProductSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

ProductSchema.set('toJSON',{virtuals:true,});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;