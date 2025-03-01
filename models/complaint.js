const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        type :Buffer,
        required: true
    },
    latitude:{
        type: Number,
        required: true,
    },
    longtitude:{
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
    isApproved: {
        type: Boolean,
        default: false
      }
});

complaintSchema.pre('save', function (next) {
    if (this.isApproved) {
      this.status = 'approved';
    }
    next();
  });
  

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;