import {WithId, Document} from 'mongodb';
import { type } from 'os';

export const HTTP = {
    '200' : 200,
    '201' : 201,
    '400' : 400,
    '202' : 202,
    '203' : 203,
    '204' : 204 };

export interface BloodRecord {
    id: number;
    hospital: string;
    date: string;
    blood_type: string;
    expiry: string;
    location: string;
    donator: string;
};

interface _MongoBloodRecord {
    _id: string;
    hospital: string;
    date: string;
    blood_type: string;
    expiry: string;
    location: string;
    donator: string;
};

export type BloodRecords = BloodRecord[];

export type MongoBloodRecord = WithId<_MongoBloodRecord | Document>;

export type MongoBloodRecords = MongoBloodRecord[];

export interface UpdateSql {
    id: number;
    hospital?: string;
    date?: string;
    blood_type?: string;
    expiry?: string;
    location?: string;
    donator?: string;
};

export interface InsertSql {
    id: number;
    hospital: string;
    blood_type: string;
    location: string;
    donator: string;
}


export interface CacheSql {
    location: string;
    type: string;
}

export interface BloodTypes {
    'O Positive': number;
    'O Negative': number;
    'A Positive': number;
    'A Negative': number;
    'B Positive': number;
    'B Negative': number;
    'AB Positive': number;
    'AB Negative': number;
};

export interface Info {
    total_blood: number;
    total_emergencies: number;
    percentage_emergencies: number;
    blood_per_type: BloodTypes
};
export const NULL = 0;
