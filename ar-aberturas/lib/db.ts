import { db } from './firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import type { UserRole } from '@/constants/user-role'

// method to find a user by username and password
export async function findUser(usuario: string, contraseña: string) {

  if (usuario === 'Admin' && contraseña === 'admin123' || usuario === 'Fabrica' && contraseña === 'fabrica123'
    || usuario === 'Colocador' && contraseña === 'colocador123' || usuario === 'Ventas' && contraseña === 'ventas123' || usuario === 'Marketing' && contraseña === 'marketing123') {
      const docData = { usuario, contraseña, role: usuario as UserRole }
      return docData
  }
  return null
  /* Lo comentamos para no usar firebase en desarrollo local
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('usuario', '==', usuario), where('contraseña', '==', contraseña))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docData = snap.docs[0].data() as { usuario: string; contraseña: string; role: UserRole }
  return docData 
  */

}

