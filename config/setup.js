import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import dotenv from "dotenv";
import { COOKIE_PASSWORD } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";
import UserModel from "../models/user.model.js";
import BusModel from "../models/bus.model.js";
import TicketModel from "../models/ticket.model.js";

dotenv.config();

AdminJS.registerAdapter(AdminJSMongoose);

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_LOGIN_EMAIL,     
  password: process.env.ADMIN_LOGIN_PASSWORD,
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export const buildAdminJS = async (app) => {
  const admin = new AdminJS({
    resources: [
      { resource: UserModel },    
      { resource: BusModel },
      { resource: TicketModel },
    ],
    branding: {
      companyName: "Bus Booking",
      withMadeWithLove: false,
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: "/admin",
  });

  const MongoDBStore = ConnectMongoDBSession(session);
  const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: COOKIE_PASSWORD,
    },

    null,
    
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "adminJS",
    }
  );

  app.use(admin.options.rootPath, adminRouter);
};
