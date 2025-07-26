import Bus from "../models/bus.model.js";
import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
import { v4 as uuidv4 } from "uuid";

export const getUserTicket = async (req, res) => {
  try {
    const userId = req.userId;

    const tickets = await Ticket.find({ user: userId })
      .populate(
        "bus",
        "busId from to busType company departureTime arrivalTime price"
      )
      .sort({ bookedAt: -1 });

    if (!tickets || tickets.length == 0) {
      return res.status(404).json({ message: "No tickets found." });
    }

    res.status(200).json({
      success: true,
      tickets: tickets || [],
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    req.status(500).json({ error: "Internel Server Error" });
  }
};

export const bookTicket = async (req, res) => {
    try {
        const {busId, date, seatNumber} = req.body;
        const userId = req.userId

        if(!busId || !date || !seatNumber || !seatNumber.length == 0) {
            return res.status(400).json({error: "All fields are required."})
        }

        const bus = await Bus.findOne({busId})

        if(!bus) {
            return res.status(404).json({error: "Bus not found."})
        }

        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({error: "User not found."})
        }

        const unavailableSeats = seatNumber.filter((seatNum) => {
            bus.seats?.some((row) => 
            row?.some((seat) => seat.seat_id === seatNum && seat.booked))
        });

        if(unavailableSeats.length > 0) {
            return res.status(400).json({error: "Some seats are a;ready booked.", unavailableSeats})
        }

        const totalFare = bus.price * seatNumber*length;
        const newTicket = new Ticket({
            user: userId,
            bus: bus._id,
            date,
            seatNumber,
            total_fare: totalFare,
            pnr: uuidv4().slice(0, 10).toUpperCase()
        })

        await newTicket.save()

        res.status(201).json({
            succes: true,
            message: "Ticket booked successfully",
            ticket: newTicket
        })



    } catch (error) {
        console.error("Error booking ticket:", error)
        req.status(500).json({error: "Internel Server Error"})
    }
}
