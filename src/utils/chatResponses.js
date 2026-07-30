export function getFallbackAssistantReply(message = '') {
  const text = `${message || ''}`.toLowerCase();

  if (/medic|tablet|dose|pill|medicine|prescription/i.test(text)) {
    return 'I can offer general guidance, but medication decisions should be confirmed with your doctor or pharmacist. Please avoid changing any dose on your own, especially if you have allergies or are taking multiple medicines.';
  }

  if (/symptom|pain|fever|cough|headache|dizzy|nause|vomit|breath/i.test(text)) {
    return 'I can help you assess general symptoms, but urgent or severe symptoms should be reviewed promptly by a clinician. If you have chest pain, trouble breathing, confusion, or heavy bleeding, seek emergency care immediately.';
  }

  if (/appointment|book|visit|schedule|clinic/i.test(text)) {
    return 'You can use the appointments area in SmartCare Connect to view or book a visit. For urgent needs, please contact the hospital directly or use the emergency option.';
  }

  if (/report|lab|result|blood|heart rate|vitals/i.test(text)) {
    return 'I can help summarize general patterns in reports and vitals, but medical results should be reviewed by your care team for a confirmed interpretation.';
  }

  return 'I can help with symptoms, medications, appointments, and general care guidance. For urgent concerns, please contact emergency services or your care team immediately.';
}
