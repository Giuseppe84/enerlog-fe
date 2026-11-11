
export type Payment = {
    id: String;
    date: String;
    amount: String;
    isRefund: Boolean;
    createdAt: String;
    updatedAt: String;
    status: String;
    method: String;
    client?: {
        id?: string;
        firstName: string;
        lastName: string;
    };
    orders?: {
        id?: string;
    }
}

