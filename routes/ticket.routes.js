import express from "express";
import verifyToken from '../middleware/verify.middleware.js'
import { bookTicket, getUserTicket } from "../controllers/ticket.contoller.js";

const router = express.Router()

router.post("/book", verifyToken, bookTicket)
router.get("/my-tickets", verifyToken, getUserTicket)

export default router