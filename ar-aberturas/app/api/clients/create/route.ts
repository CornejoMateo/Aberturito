import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: Request) {
    const { name, last_name, email, phone_number, locality } = await req.json();

    try {
        const docRef = await addDoc(collection(db, 'clients'), {
            name,
            last_name,
            email,
            phone_number,
            locality,
            created_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ id: docRef.id }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al crear el cliente' }), { status: 500 });
    }
}
