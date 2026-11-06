/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Backend User Payload Normalizer
 * 
 * Normalizes varied backend user responses (DB columns: full_name, village_panchayat;
 * JWT payload fields: name, villagePanchayat) into a consistent client structure.
 * 
 * Preserves id, phone, and role.
 */

export function normalizeUser(userData) {
  if (!userData || typeof userData !== 'object') return null;

  const name = userData.name || userData.full_name || userData.fullName || 'Citizen User';
  const villagePanchayat = userData.villagePanchayat || userData.village_panchayat || '';

  return {
    id: userData.id,
    name: String(name).trim(),
    phone: userData.phone ? String(userData.phone).trim() : '',
    role: userData.role || 'citizen',
    villagePanchayat: String(villagePanchayat).trim(),
    sessionStartedAt: userData.sessionStartedAt || new Date().toISOString()
  };
}

