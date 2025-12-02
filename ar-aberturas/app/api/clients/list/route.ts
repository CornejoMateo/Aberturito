import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        const snap = await getDocs(collection(db, 'clients'));
        const clients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return new Response(JSON.stringify(clients), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al obtener los clientes' }), { status: 500 });
    }
}
