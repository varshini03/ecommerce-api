const mongoose = require('mongoose');
const CategorySchema = mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
        },

        icon : {
            type : String,
            required : false,
            default : '',
        },
    },
    {
        timestamps : true,
    }
);

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;