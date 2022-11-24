export const HTTP = {
    '200' : 200,
    '201' : 201,
    '400' : 400 };

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
