// Object types
import localizedString from './objects/localizedString';
import localizedText from './objects/localizedText';
import localizedBlockContent from './objects/localizedBlockContent';
import localizedImage from './objects/localizedImage';
import eventTreatmentLink from './objects/eventTreatmentLink';
import priceOption from './objects/priceOption';
import faqItem from './objects/faqItem';
import businessHours from './objects/businessHours';
import snsLink from './objects/snsLink';

// Document types
import treatment from './documents/treatment';
import baCase from './documents/baCase';
import promotion from './documents/promotion';
import doctor from './documents/doctor';
import quickEntryTab from './documents/quickEntryTab';
import quickEntryCard from './documents/quickEntryCard';
import brandPhilosophy from './documents/brandPhilosophy';
import clinicInfo from './documents/clinicInfo';

import statsStrip from './documents/statsStrip';
import eventPopup from './documents/eventPopup';
import facility from './documents/facility';
import equipment from './documents/equipment';
import pressArticle from './documents/pressArticle';
import youtubeVideo from './documents/youtubeVideo';
import blogPost from './documents/blogPost';
import notice from './documents/notice';
import contactInquiry from './documents/contactInquiry';
import pageHero from './documents/pageHero';
import { sectionVisibility } from './documents/sectionVisibility';
import { crmSettings } from './documents/crmSettings';

export const schemaTypes = [
  // Objects (must be registered before documents that reference them)
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedImage,
  eventTreatmentLink,
  priceOption,
  faqItem,
  businessHours,
  snsLink,

  // Documents
  treatment,
  baCase,
  promotion,
  doctor,
  quickEntryTab,
  quickEntryCard,
  brandPhilosophy,
  clinicInfo,
  statsStrip,
  eventPopup,
  facility,
  equipment,
  pressArticle,
  youtubeVideo,
  blogPost,
  notice,
  contactInquiry,
  pageHero,
  sectionVisibility,
  crmSettings,
];
