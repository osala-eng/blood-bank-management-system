import {mongo} from '../database';

export const isMongoConnected = new Promise<boolean>((resolve, _reject) =>{
    if(mongo.conected){
        resolve(true)
    }
    else{
        setTimeout(()=>{resolve(mongo.conected);}, 10000);
    }
});