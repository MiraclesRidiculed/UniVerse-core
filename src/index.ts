import fs, { promises } from 'fs';
import path from 'path';

import express from 'express';
// @ts-ignore
import compression from 'compression';
import dotenv from "dotenv";
import mongoose from 'mongoose'

import { err, success, misc, blue, caution } from './modules/logger';
import { authenticateAdmin, rateLimiterMiddleware } from './modules/util';

const App = express();
dotenv.config({ path: '../.env' });


App.use(express.json());
App.use(compression());
App.disable('x-powered-by');
App.use(rateLimiterMiddleware);

