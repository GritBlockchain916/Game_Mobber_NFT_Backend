const mongoose = require('mongoose');
const { Schema } = mongoose;

class BaseSchema extends Schema {
    constructor(definition, options) {
      super(definition, { ...options, timestamps: true });
      
      // Add the getData method to schema methods
      this.methods.getData = function () {
        const obj = this.toObject();  // Convert document to plain JS object
        delete obj.createdAt;         // Remove createdAt
        delete obj.updatedAt;         // Remove updatedAt
        return obj;                   // Return the object without timestamps
      };
    }
}

module.exports = BaseSchema;