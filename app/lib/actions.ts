'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

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
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // clearing prefetch cache of invoices to fetch again from server
    revalidatePath('/dashboard/invoices');

    // redirect again to invoice page
    redirect('/dashboard/invoices');
    // console.log(rawFormData);

}

export const updateInvoice = async (id: string, formData: FormData) => {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sql`
     UPDATE invoices
     SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
     WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};


// deleteing the invoice 
export const deleteInvoice = async (id: string) => {
    await sql`DELETE FROM invoices WHERE id = ${id}`;

    revalidatePath('/dashboard/invoices');
}

