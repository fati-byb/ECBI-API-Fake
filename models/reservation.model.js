const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  // time:{
  //   type:String,
  //   required:false
  // },
  date: {
    type: Date,
    required: true,
   
  },
  
  // table: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Table"
  // },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    lowercase: true,
  
    required: [false, "can't be blank"],
  
  
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  
  },
  shiftId:
    { type: mongoose.Schema.Types.ObjectId } 
  ,
  peopleCount: {  
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["enregistré", "Annulé", "en attente", "Arrivé", "Départ", "No show","checked in"],
    default: "en attente"
  },
  pointDeVente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointDeVente', // Reference the PointDeVente collection
    required: true, // Make it required if every reservation must belong to a PointDeVente
  },
}, {
  timestamps: true,
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;


