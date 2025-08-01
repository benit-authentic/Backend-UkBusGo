/**
 * Utilitaires pour la validation et normalisation des numéros de téléphone togolais
 * Simplifié sans détection automatique de réseau (plus fiable)
 */

/**
 * Valide un numéro de téléphone togolais
 * Formats acceptés: 90123456, +22890123456, 0022890123456
 */
export const validateTogolanesePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Patterns valides pour le Togo
  const patterns = [
    /^[679]\d{7}$/,                   // 90123456, 70123456 ou 64000001 (numéros test) (8 chiffres)
    /^\+228[679]\d{7}$/,              // +22890123456, +22864000001
    /^228[679]\d{7}$/,                // 22890123456, 22864000001  
    /^0228[679]\d{7}$/                // 022890123456, 022864000001
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Normalise un numéro de téléphone togolais au format standard (8 chiffres)
 * Exemple: +22890123456 → 90123456
 */
export const normalizeTogolanesePhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Numéro de téléphone invalide');
  }
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Extraire les 8 derniers chiffres pour le Togo
  if (cleaned.match(/^[679]\d{7}$/)) {
    return cleaned; // Déjà normalisé (8 chiffres) - inclut les numéros de test 6XXXXXXX
  }
  
  if (cleaned.match(/^\+228[679]\d{7}$/)) {
    return cleaned.slice(-8); // Supprimer +228
  }
  
  if (cleaned.match(/^228[679]\d{7}$/)) {
    return cleaned.slice(-8); // Supprimer 228
  }
  
  if (cleaned.match(/^0228[679]\d{7}$/)) {
    return cleaned.slice(-8); // Supprimer 0228
  }
  
  throw new Error('Format de numéro de téléphone togolais invalide');
};

/**
 * Formate un numéro togolais pour l'affichage
 * Exemple: 90123456 → +228 90 12 34 56
 */
export const formatTogolanesePhoneNumber = (phone: string): string => {
  const normalized = normalizeTogolanesePhoneNumber(phone);
  return `+228 ${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)}`;
};

/**
 * Vérifie si un numéro est un numéro de test FedaPay
 */
export const isTestPhoneNumber = (phone: string): boolean => {
  const normalized = normalizeTogolanesePhoneNumber(phone);
  const testNumbers = ['64000001', '64000000']; // Numéros de test FedaPay
  return testNumbers.includes(normalized);
};

/**
 * Convertit un numéro au format international pour FedaPay
 * Exemple: 90123456 → +22890123456
 */
export const toInternationalFormat = (phone: string): string => {
  const normalized = normalizeTogolanesePhoneNumber(phone);
  return `+228${normalized}`;
};

/**
 * Prépare un numéro pour l'API FedaPay (format requis par FedaPay)
 * Exemple: +22890123456 → { number: "90123456", country: "TG" }
 */
export const formatForFedaPay = (phone: string): { number: string; country: string } => {
  const normalized = normalizeTogolanesePhoneNumber(phone);
  return {
    number: normalized, // Juste les 8 chiffres sans préfixe
    country: 'TG'      // Togo par défaut pour votre app
  };
};
