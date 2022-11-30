import {mongo} from '../database';

export const isMongoConnected = new Promise<boolean>((resolve, _reject) =>{
    const time = 10000;
    setTimeout(()=>{resolve(mongo.conected)}, time);
});
