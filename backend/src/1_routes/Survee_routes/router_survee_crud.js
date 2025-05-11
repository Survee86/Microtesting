import express from 'express';
import { mongoHealthMiddleware }    from '../../2_middleware/checkMongo.js'
import  { 
            create_survee,  
            read_survee,
            update_survee,
            delete_survee
        } from '../../3_controllers/Survee_controllers/survee_crud.js';


const survee_router = express.Router();


survee_router.post('/create',  mongoHealthMiddleware, create_survee    );
survee_router.get ('/read',    mongoHealthMiddleware, read_survee      );
survee_router.post('/update',  mongoHealthMiddleware, update_survee    );
survee_router.post('/delete',  mongoHealthMiddleware, delete_survee    );

export default survee_router;
