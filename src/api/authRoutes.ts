import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import * as bcrypt from 'bcryptjs';
const jwt = require("jsonwebtoken");
const Config = require('../config');

import {UnitOfWork} from '../db';

const routes: RouteConfiguration[] =  [
    {
        method: 'POST',
        path: '/auth',
        config: {
            auth: false,
            description: 'Log user in',
            cors: true,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }
            },
        },
        handler: async (request: Request, h: ReplyWithContinue) => {
            const config = new Config.default();
            const uow: UnitOfWork = await request.app.getNewUoW();

            const user = await uow.usersRepository.getUserByEmail(request.payload.email);

            if (user === null || !await bcrypt.compareSync(request.payload.password, user.password)) {
                return h.response('unauthorized').code(401);
            }

            const tokenPayload = {
                currentUserId: user.id
            };
        
            const token = jwt.sign(tokenPayload, config.default.jsonSecret, {
                expiresIn: config.default.jwtValidTimespan
            });
            
            const response = h.response({status: 0, message: 'success', data: null});
            response.header('Authorization', `Bearer ${token}`);
            response.header('Access-Control-Expose-Headers', 'Authorization');
            return response;
        }
    }
];

export default routes;