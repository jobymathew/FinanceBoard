'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';


// creating a schema for type validation using zod
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });


export const createInvoice = async (formData: FormData) => {


    // getting raw data from form data
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // storing amount in cents to avoid javascript floating-point errors
    const amountInCents: number = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // sql to insert into table
    await sql`
        INSERT INTO customer (custmer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // console.log(rawFormData);

}