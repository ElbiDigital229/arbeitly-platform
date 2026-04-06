import { ref, computed } from 'vue';

const currentLocale = ref<'de' | 'en'>(
  (localStorage.getItem('arbeitly_locale') as 'de' | 'en') || 'en'
);

const translations: Record<string, Record<string, string>> = {
  // Navigation
  'nav.applications': { de: 'Bewerbungen', en: 'Applications' },
  'nav.cv': { de: 'Lebenslauf', en: 'CV' },
  'nav.files': { de: 'Dateien', en: 'Files' },
  'nav.faq': { de: 'FAQ & Vorbereitung', en: 'FAQ & Interview Prep' },
  'nav.onboarding': { de: 'Onboarding', en: 'Onboarding' },
  'nav.profile': { de: 'Profil & Einstellungen', en: 'Profile & Settings' },
  'nav.portal': { de: 'Mein Portal', en: 'My Portal' },
  'nav.account': { de: 'Konto', en: 'Account' },
  'nav.collapse': { de: 'Einklappen', en: 'Collapse' },
  'nav.logout': { de: 'Abmelden', en: 'Log out' },
  'nav.search': { de: 'Suchen...', en: 'Search...' },
  'nav.upgrade': { de: 'Plan upgraden', en: 'Upgrade Plan' },

  // Onboarding
  'onboarding.personalInfo': { de: 'Persoenliche Daten', en: 'Personal Info' },
  'onboarding.uploadCv': { de: 'Lebenslauf hochladen', en: 'Upload CV' },
  'onboarding.coverLetter': { de: 'Anschreiben', en: 'Cover Letter' },
  'onboarding.firstName': { de: 'Vorname', en: 'First Name' },
  'onboarding.lastName': { de: 'Nachname', en: 'Last Name' },
  'onboarding.phone': { de: 'Telefon', en: 'Phone' },
  'onboarding.location': { de: 'Standort', en: 'Location' },
  'onboarding.bio': { de: 'Kurze Bio', en: 'Short Bio' },
  'onboarding.continue': { de: 'Weiter', en: 'Continue' },
  'onboarding.back': { de: 'Zurueck', en: 'Back' },
  'onboarding.complete': { de: 'Onboarding abschliessen', en: 'Complete Onboarding' },
  'onboarding.completing': { de: 'Wird abgeschlossen...', en: 'Completing...' },
  'onboarding.credentials': { de: 'Bewerbungszugangsdaten', en: 'Application Credentials' },
  'onboarding.credentialsDesc': { de: 'Erstellen Sie eine Dummy-E-Mail und ein Passwort, damit Ihr Berater sich in Ihrem Namen bewerben kann.', en: 'Create a dummy email and password for your advisor to apply to jobs on your behalf.' },
  'onboarding.dummyEmail': { de: 'Dummy-E-Mail', en: 'Dummy Email' },
  'onboarding.dummyPassword': { de: 'Dummy-Passwort', en: 'Dummy Password' },
  'onboarding.language': { de: 'Bevorzugte Sprache', en: 'Preferred Language' },

  // Applications
  'apps.title': { de: 'Bewerbungen', en: 'Applications' },
  'apps.addApplication': { de: 'Bewerbung hinzufuegen', en: 'Add Application' },
  'apps.noApplications': { de: 'Keine Bewerbungen', en: 'No applications yet' },
  'apps.jobTitle': { de: 'Stellenbezeichnung', en: 'Job Title' },
  'apps.company': { de: 'Unternehmen', en: 'Company' },
  'apps.status': { de: 'Status', en: 'Status' },
  'apps.salary': { de: 'Gehalt', en: 'Salary' },
  'apps.notes': { de: 'Notizen', en: 'Notes' },

  // Statuses
  'status.TO_APPLY': { de: 'Zu bewerben', en: 'To Apply' },
  'status.APPLIED': { de: 'Beworben', en: 'Applied' },
  'status.IN_PROGRESS': { de: 'In Bearbeitung', en: 'In Progress' },
  'status.INTERVIEW': { de: 'Vorstellungsgespraech', en: 'Interview' },
  'status.OFFER': { de: 'Angebot', en: 'Offer' },
  'status.ACCEPTED': { de: 'Angenommen', en: 'Accepted' },
  'status.REJECTED': { de: 'Abgelehnt', en: 'Rejected' },
  'status.FAILED': { de: 'Fehlgeschlagen', en: 'Failed' },

  // FAQ
  'faq.title': { de: 'FAQ', en: 'FAQ' },
  'faq.description': { de: 'Fragen und Antworten, die Ihr Berater vorbereitet hat.', en: 'Questions and answers prepared by your advisor.' },
  'faq.empty': { de: 'Noch keine FAQ vorhanden', en: 'No FAQ yet' },
  'faq.approve': { de: 'Genehmigen', en: 'Approve' },
  'faq.approved': { de: 'Genehmigt', en: 'Approved' },

  // Common
  'common.loading': { de: 'Laden...', en: 'Loading...' },
  'common.save': { de: 'Speichern', en: 'Save' },
  'common.cancel': { de: 'Abbrechen', en: 'Cancel' },
  'common.delete': { de: 'Loeschen', en: 'Delete' },
  'common.edit': { de: 'Bearbeiten', en: 'Edit' },
};

export function useLocale() {
  const locale = computed(() => currentLocale.value);

  function t(key: string): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLocale.value] || entry.en || key;
  }

  function setLocale(lang: 'de' | 'en') {
    currentLocale.value = lang;
    localStorage.setItem('arbeitly_locale', lang);
  }

  return { locale, t, setLocale };
}
