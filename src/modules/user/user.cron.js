import cron from 'node-cron';
import * as dbService from "../../DB/db.service.js"
import userModel from '../../DB/models/user.model.js';

cron.schedule('* * * * 0', async () => {
    const users = await dbService.deleteMany({
        model:userModel,
        filter:{
            confirmed: { $exists: false },
        }
    })
    console.log(users);
});