import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
	const { username, password } = await req.json();

	const q = query(collection(db, 'users'), where('username', '==', username));
	const snap = await getDocs(q);

	if (snap.empty) {
		return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
	}

	const user = snap.docs[0].data() as { username: string; password: string; role: string };

	const valid = await bcrypt.compare(password, user.password);
	if (!valid) {
		return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401 });
	}

	return new Response(JSON.stringify({ username: user.username, role: user.role }), {
		status: 200,
	});
}
