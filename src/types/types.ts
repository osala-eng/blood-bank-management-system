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

export type BloodRecords = BloodRecord[];

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
export const NULL = 0;
