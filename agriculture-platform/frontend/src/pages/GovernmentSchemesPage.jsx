import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import BinaryOrbits from '../components/BinaryOrbits';
import './GovernmentSchemes.css';

// Default verified schemes fallback in case of offline or initial DB setup
const FALLBACK_SCHEMES = [
  {
    schemeCode: 'PM-KISAN',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    titleTa: 'பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)',
    description: 'Direct income support of ₹6,000 per year provided in three equal installments of ₹2,000 to all eligible landholding farmer families via Direct Benefit Transfer (DBT).',
    descriptionTa: 'அனைத்து நிலம் வைத்திருக்கும் விவசாய குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 நேரடி பண உதவி. ₹2,000 வீதம் 3 தவணைகளில் வங்கி கணக்கில் நேரடியாக செலுத்தப்படுகிறது.',
    department: 'Central',
    category: 'Income Support',
    subsidyRate: '₹6,000 / Year (100% Grant)',
    maxBenefit: '₹6,000 per financial year',
    targetBeneficiary: 'All Landholding Farmer Families',
    targetBeneficiaryTa: 'நில உரிமை கொண்ட அனைத்து விவசாய குடும்பங்கள்',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Farmer family must hold cultivable agricultural land in their name',
      'Land ownership recorded in state land records (Patta / Chitta)',
      'Institutional landholders and high-income taxpayers are excluded',
      'Bank account must be active and mapped to NPCI with Aadhaar'
    ],
    eligibilityCriteriaTa: [
      'விவசாய குடும்பத்தின் பெயரில் சாகுபடிக்கு உகந்த நிலம் இருக்க வேண்டும்',
      'பட்டா / சிட்டாவில் பெயர் பதிவு செய்யப்படிருக்க வேண்டும்',
      'அரசு ஊழியர்கள் மற்றும் வருமான வரி செலுத்துபவர்கள் தவிர மற்ற விவசாயிகள்',
      'வங்கி கணக்கு ஆதாருடன் (NPCI) இணைக்கப்பட்டிருக்க வேண்டும்'
    ],
    requiredDocuments: [
      'Aadhaar Card (Mandatory)',
      'Patta / Chitta Land Title document',
      'Bank Passbook copy (Aadhaar linked)',
      'Active Mobile number linked to Aadhaar'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை (கட்டாயம்)',
      'பட்டா / சிட்டா நில உரிமை நகல்',
      'ஆதாருடன் இணைக்கப்பட்ட வங்கி கணக்கு புத்தகம்',
      'ஆதாருடன் இணைக்கப்பட்ட செல்போன் எண்'
    ],
    officialPortalUrl: 'https://pmkisan.gov.in',
    helpline: '155261',
    deadlineInfo: 'Open throughout the year (Apply anytime via CSC / e-Sevai)',
    isActive: true
  },
  {
    schemeCode: 'PMKSY-MICRO-IRRIGATION',
    title: 'Micro Irrigation Scheme (PMKSY - Drip & Sprinkler Subsidy)',
    titleTa: 'பிரதம மந்திரி நுண்ணீர் பாசன திட்டம் (சொட்டு நீர் & தெளிப்பு நீர் பாசனம்)',
    description: 'Comprehensive irrigation subsidy providing 100% subsidy for Small & Marginal farmers and 75% for other farmers in Tamil Nadu to install modern water-saving drip and sprinkler irrigation systems.',
    descriptionTa: 'தமிழ்நாட்டில் சிறு மற்றும் குறு விவசாயிகளுக்கு 100% முழு மானியம், இதர விவசாயிகளுக்கு 75% மானியத்தில் சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசன கருவிகள் வழங்கப்படுகிறது.',
    department: 'State - Tamil Nadu',
    category: 'Irrigation',
    subsidyRate: '100% for Small/Marginal, 75% for Others',
    maxBenefit: 'Up to ₹1,15,000 / hectare',
    targetBeneficiary: 'Small & Marginal Farmers (< 5 Acres), All Cultivators',
    targetBeneficiaryTa: 'சிறு & குறு விவசாயிகள் (< 5 ஏக்கர்), அனைத்து விவசாயிகள்',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Must hold agricultural/horticultural land with valid Patta/Chitta',
      'Must have an assured functional water source (Open well, Borewell, or Canal)',
      'Electricity service connection or diesel pump set on the farm',
      '100% subsidy applies to land holding up to 5 acres (2 hectares)'
    ],
    eligibilityCriteriaTa: [
      'சொந்த விவசாய நிலம் மற்றும் செல்லுபடியாகும் பட்டா/சிட்டா இருக்க வேண்டும்',
      'கிணறு, ஆழ்துளை கிணறு போன்ற உறுதி செய்யப்பட்ட நீர் ஆதாரம் இருக்க வேண்டும்',
      'மின்சார இணைப்பு அல்லது டீசல் பம்ப் செட் பயன்பாட்டில் இருக்க வேண்டும்',
      'சிறு குறு விவசாயிகளுக்கு (5 ஏக்கர் வரை) 100% முழு மானியம்'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Patta / Chitta document',
      'FMB Sketch (Field Measurement Book)',
      'Adangal / Crop Sowing Certificate from VAO',
      'Soil & Water Testing Report (from Agrisnet AEC lab)',
      'Bank Passbook copy'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை',
      'பட்டா / சிட்டா நகல்',
      'FMB நில வரைபடம்',
      'VAO வழங்கிய அடங்கல் சான்றிதழ்',
      'மண் மற்றும் நீர் பரிசோதனை அறிக்கை',
      'வங்கி கணக்கு புத்தக நகல்'
    ],
    officialPortalUrl: 'https://tnhorticulture.tn.gov.in/horti/pmksy',
    helpline: '1800-180-1551',
    deadlineInfo: 'Applications accepted round the year through Horticulture Extension Centre / Uzhavan App',
    isActive: true
  },
  {
    schemeCode: 'SMAM-AGRICULTURAL-MECHANIZATION',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM - Farm Equipment)',
    titleTa: 'விவசாய இயந்திரமயமாக்கல் திட்டம் (டிராக்டர் & கருவி மானியம்)',
    description: 'Financial assistance of 40% to 50% for purchasing agricultural machinery including Tractors, Power Tillers, Rotavators, Paddy Transplanters, Combine Harvesters, and Multi-crop Thrashers.',
    descriptionTa: 'டிராக்டர், பவர் டில்லர், ரோட்டவேட்டர், நெல் நடவு இயந்திரம் மற்றும் அறுவடை இயந்திரங்கள் வாங்க 40% முதல் 50% வரை மானியம் வழங்கப்படுகிறது.',
    department: 'State - Tamil Nadu',
    category: 'Machinery',
    subsidyRate: '40% - 50% on Equipment Cost',
    maxBenefit: 'Up to ₹2,50,000 depending on machine type',
    targetBeneficiary: 'Individual Farmers, SC/ST (50%), Women Farmers (50%)',
    targetBeneficiaryTa: 'விவசாயிகள், ஆதிதிராவிடர்/பழங்குடியினர் (50%), பெண் விவசாயிகள் (50%)',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Individual farmer must possess cultivable agricultural land',
      'Must not have availed subsidy for the same equipment type in the last 5 years',
      'Preference given to Small, Marginal, Women, and SC/ST farmers (higher 50% bracket)',
      'Equipment must be purchased from Government empanelled dealers'
    ],
    eligibilityCriteriaTa: [
      'விவசாய நிலம் வைத்திருக்கும் அனைத்து விவசாயிகளும் தகுதியுடையவர்கள்',
      'கடந்த 5 ஆண்டுகளில் இதே கருவிக்கு அரசு மானியம் பெற்றிருக்கக் கூடாது',
      'பெண்கள் மற்றும் ஆதிதிராவிட விவசாயிகளுக்கு முன்னுரிமை மற்றும் 50% மானியம்',
      'அங்கீகரிக்கப்பட்ட டீலர்களிடம் மட்டுமே கருவிகளை வாங்க வேண்டும்'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Patta / Chitta title deed',
      'Passport size photos (2)',
      'Bank Passbook copy',
      'Community Certificate (for SC/ST higher subsidy)',
      'Equipment quotation from authorized dealer'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை',
      'பட்டா / சிட்டா நகல்',
      'பாஸ்போர்ட் அளவு புகைப்படங்கள் (2)',
      'வங்கி கணக்கு புத்தக நகல்',
      'சாதி சான்றிதழ் (கூடுதல் மானியத்திற்கு)',
      'டீலரின் விலை மதிப்பீட்டு ரசீது (Quotation)'
    ],
    officialPortalUrl: 'https://agrimachinery.nic.in',
    helpline: '044-29530260',
    deadlineInfo: 'Seasonal batches released through Tamil Nadu Agricultural Engineering Department',
    isActive: true
  },
  {
    schemeCode: 'PMFBY-CROP-INSURANCE',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY - Crop Insurance)',
    titleTa: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
    description: 'Comprehensive yield-based crop insurance protecting farmers against non-preventable natural risks (floods, drought, unseasonal rain, pests) at heavily subsidized nominal premium rates (1.5% - 2%).',
    descriptionTa: 'இயற்கை பேரிடர், வெள்ளம், வறட்சி, பூச்சி தாக்குதலால் ஏற்படும் பயிர் இழப்பிற்கு முழு பாதுகாப்பு. விவசாயிகள் 1.5% முதல் 2% குறைந்த பிரீமியம் மட்டும் செலுத்தினால் போதும்.',
    department: 'Central',
    category: 'Insurance',
    subsidyRate: 'Govt pays 90%+ Premium (Farmer pays only 1.5% - 2%)',
    maxBenefit: 'Sum insured up to full crop value per acre',
    targetBeneficiary: 'All Farmers cultivating notified crops (Loanee & Non-Loanee)',
    targetBeneficiaryTa: 'அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் அனைத்து விவசாயிகளும்',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Farmers growing notified seasonal crops in notified revenue villages',
      'Both owner cultivators and documented tenant farmers are eligible',
      'Must enroll before the seasonal crop cut-off deadline',
      'Bank account must be active for direct claim payout'
    ],
    eligibilityCriteriaTa: [
      'அறிவிக்கப்பட்ட கிராமங்களில் அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் விவசாயிகள்',
      'நில உரிமையாளர்கள் மற்றும் குத்தகை விவசாயிகள் இருவருமே தகுதியுடையவர்கள்',
      'பருவக்கால கடைசி தேதி முடிவதற்குள் பதிவு செய்ய வேண்டும்',
      'நேரடி இழப்பீட்டு தொகை பெற வங்கி கணக்கு அவசியம்'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land Record (Patta / Chitta)',
      'Sowing Certificate / Adangal issued by VAO',
      'Bank Passbook copy (showing IFSC and Account number)',
      'Tenant agreement (for tenant cultivators)'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை',
      'பட்டா / சிட்டா நகல்',
      'கிராம நிர்வாக அலுவலர் (VAO) வழங்கிய அடங்கல்',
      'வங்கி கணக்கு புத்தக நகல்',
      'குத்தகை ஒப்பந்த ஆவணம் (குத்தகை விவசாயிகளுக்கு)'
    ],
    officialPortalUrl: 'https://pmfby.gov.in',
    helpline: '14447',
    deadlineInfo: 'Kharif: July 31 | Rabi / Samba Paddy: Nov 15 – Dec 15',
    isActive: true
  },
  {
    schemeCode: 'PM-KUSUM-SOLAR-PUMPS',
    title: 'PM-KUSUM Scheme (Solar Agriculture Pump Set Subsidy)',
    titleTa: 'பிஎம்-குசும் திட்டம் (சூரிய சக்தி விவசாய பம்ப் செட் மானியம்)',
    description: 'Up to 70% capital subsidy (30% Central + 40% Tamil Nadu State) to install standalone 3 HP, 5 HP, and 7.5 HP solar agricultural pumps, reducing reliance on costly diesel and erratic grid power.',
    descriptionTa: 'டீசல் மற்றும் மின்சார பற்றாக்குறையை போக்க 3 HP, 5 HP, 7.5 HP சூரிய ஒளி மின் மோட்டார்களுக்கு 70% வரை அரசு மானியம் வழங்கப்படுகிறது.',
    department: 'State - Tamil Nadu',
    category: 'Solar & Energy',
    subsidyRate: 'Up to 70% Subsidy (Farmer pays only 30%)',
    maxBenefit: 'Up to ₹1,80,000 capital subsidy',
    targetBeneficiary: 'Farmers with agriculture wells without regular grid connection',
    targetBeneficiaryTa: 'மின் இணைப்பு இல்லாத கிணறு மற்றும் போர்வெல் வைத்துள்ள விவசாயிகள்',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Must own agricultural land with functional open well or borewell',
      'Farmers waiting on TANGEDCO agricultural electricity waiting list get priority',
      'Adequate ground water depth as certified by local Agricultural Engineering Dept',
      'Land must have shadow-free space for mounting solar panels'
    ],
    eligibilityCriteriaTa: [
      'நிலம் மற்றும் பயன்பாட்டில் உள்ள கிணறு அல்லது ஆழ்துளை கிணறு இருக்க வேண்டும்',
      'மின்சார வாரிய காத்திருப்போர் பட்டியலில் உள்ள விவசாயிகளுக்கு முன்னுரிமை',
      'வேளாண் பொறியியல் துறை ஆய்வின்படி போதுமான நிலத்தடி நீர் இருக்க வேண்டும்',
      'சோலார் பேனல் அமைக்க நிழல் இல்லாத இடம் இருக்க வேண்டும்'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Patta / Chitta document',
      'Ground Water depth & yield certificate',
      'FMB Sketch of farm location',
      'Electricity Board (TANGEDCO) NOC or application slip'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை',
      'பட்டா / சிட்டா நகல்',
      'நிலத்தடி நீர் மட்ட சான்றிதழ்',
      'FMB வரைபடம்',
      'TANGEDCO மின்சார வாரிய பதிவு ரசீது'
    ],
    officialPortalUrl: 'https://pmkusum.mnre.gov.in',
    helpline: '1800-180-3333',
    deadlineInfo: 'Allocations released quarterly by Tamil Nadu Energy Development Agency (TEDA)',
    isActive: true
  },
  {
    schemeCode: 'KISAN-CREDIT-CARD',
    title: 'Kisan Credit Card (KCC - Low Interest Crop Loans)',
    titleTa: 'கிசான் கிரெடிட் கார்டு (குறைந்த வட்டி விவசாய கடன்)',
    description: 'Timely short-term agricultural credit up to ₹3,00,000 at a concessional effective interest rate of 4% per annum (with prompt repayment incentive). Collateral-free loans available up to ₹1,60,000.',
    descriptionTa: 'விவசாயிகளுக்கு ₹3,00,000 வரை குறைந்த வட்டி (4%) பயிர்க்கடன். ₹1,60,000 வரை எந்த பிணையமும் (Collateral) இன்றி உடனடியாக கடன் பெறலாம்.',
    department: 'Central',
    category: 'Credit & Finance',
    subsidyRate: '4% Effective Interest Rate (3% Prompt Subsidy)',
    maxBenefit: 'Credit limit up to ₹3,00,000',
    targetBeneficiary: 'All Farmers, Tenant Farmers, Dairy & Poultry Farmers',
    targetBeneficiaryTa: 'அனைத்து விவசாயிகள், குத்தகைதாரர்கள், கால்நடை வளர்ப்போர்',
    eligibleLandholding: ['marginal', 'small', 'large'],
    eligibilityCriteria: [
      'Owner cultivators, tenant farmers, oral lessees, and sharecroppers',
      'Self-Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers',
      'Animal husbandry, dairy, and fisheries farmers are also eligible',
      'Valid land cultivation proof or animal asset records'
    ],
    eligibilityCriteriaTa: [
      'நில உரிமையாளர்கள் மற்றும் குத்தகை விவசாயிகள்',
      'விவசாய சுயஉதவி குழுக்கள் மற்றும் கூட்டு பொறுப்பு குழுக்கள்',
      'கால்நடை, பால் பண்ணை மற்றும் மீன்வளர்ப்பு தொழிலில் உள்ளவர்கள்',
      'சாகுபடி அல்லது கால்நடை விவரங்கள் இருக்க வேண்டும்'
    ],
    requiredDocuments: [
      'Aadhaar Card and PAN Card',
      'Land Ownership Record (Patta / Chitta / Land Tax receipt)',
      'Sowing Certificate from VAO',
      'Passport size photos (2)',
      'No-due certificate from primary cooperative bank'
    ],
    requiredDocumentsTa: [
      'ஆதார் அட்டை மற்றும் பான் அட்டை',
      'பட்டா / சிட்டா / நில வரி ரசீது',
      'VAO சாகுபடி சான்றிதழ்',
      'பாஸ்போர்ட் புகைப்படங்கள் (2)',
      'வங்கி நிலுவை இல்லா சான்றிதழ்'
    ],
    officialPortalUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    helpline: '1800-115-565',
    deadlineInfo: 'Available at all Nationalized Banks, RRBs & Primary Agriculture Cooperative Societies (PACS)',
    isActive: true
  }
];

const CATEGORIES = [
  'All',
  'Income Support',
  'Irrigation',
  'Machinery',
  'Insurance',
  'Solar & Energy',
  'Credit & Finance',
  'Inputs & Seeds',
  'Social Welfare'
];

export default function GovernmentSchemesPage({ embedded = false }) {
  const { language, isTa, toggleLanguage } = useLanguage();

  const [schemes, setSchemes] = useState(FALLBACK_SCHEMES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState('All');
  const [category, setCategory] = useState('All');
  const [landSize, setLandSize] = useState('all');
  const [search, setSearch] = useState('');

  // Active Scheme Modal (Checklist Drawer)
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/schemes');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSchemes(res.data);
        } else {
          setSchemes(FALLBACK_SCHEMES);
        }
      } catch (err) {
        console.warn('Could not load schemes from API, falling back to verified dataset:', err);
        setSchemes(FALLBACK_SCHEMES);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // When a modal opens, load document checklist state from localStorage
  const handleOpenModal = (scheme) => {
    setSelectedScheme(scheme);
    try {
      const saved = localStorage.getItem(`scheme_docs_${scheme.schemeCode}`);
      setCheckedDocs(saved ? JSON.parse(saved) : {});
    } catch {
      setCheckedDocs({});
    }
  };

  const handleToggleDoc = (docIndex) => {
    if (!selectedScheme) return;
    const next = { ...checkedDocs, [docIndex]: !checkedDocs[docIndex] };
    setCheckedDocs(next);
    localStorage.setItem(`scheme_docs_${selectedScheme.schemeCode}`, JSON.stringify(next));
  };

  // Filter schemes
  const filteredSchemes = schemes.filter((s) => {
    if (department !== 'All') {
      if (department === 'Central' && s.department !== 'Central') return false;
      if (department === 'State' && !s.department.includes('State')) return false;
    }

    if (category !== 'All' && s.category !== category) {
      return false;
    }

    if (landSize !== 'all' && s.eligibleLandholding && s.eligibleLandholding.length > 0) {
      if (!s.eligibleLandholding.includes(landSize)) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEn = (s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
      const matchTa = (s.titleTa || '').includes(q) || (s.descriptionTa || '').includes(q);
      const matchCode = (s.schemeCode || '').toLowerCase().includes(q);
      if (!matchEn && !matchTa && !matchCode) return false;
    }

    return true;
  });

  // Calculate readiness meter for active modal
  const totalDocs = selectedScheme
    ? isTa && selectedScheme.requiredDocumentsTa?.length
      ? selectedScheme.requiredDocumentsTa.length
      : selectedScheme.requiredDocuments?.length || 0
    : 0;

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPercent = totalDocs > 0 ? Math.min(100, Math.round((checkedCount / totalDocs) * 100)) : 0;

  return (
    <div className={`schemes-page-wrapper ${embedded ? 'embedded-view' : ''}`}>
      {!embedded && <BinaryOrbits className="binary-orbits-fixed-bg" />}
      {/* Standalone navigation if visited directly via /schemes */}
      {!embedded && (
        <div className="schemes-standalone-nav">
          <div className="schemes-breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <span>/</span>
            <span>Government Schemes</span>
          </div>
        </div>
      )}


      {/* Hero Banner */}
      <header className="schemes-hero-card">
        <div className="schemes-hero-pill">
          <span>🏛️</span>
          <span>{isTa ? 'மத்திய & தமிழக அரசு திட்டங்கள்' : 'Central & State Government Portals'}</span>
        </div>
        <h1 className="schemes-hero-title">
          {isTa
            ? 'அரசு விவசாய நலத்திட்டங்கள் & மானிய வழிகாட்டி'
            : 'Government Agricultural Schemes & Subsidy Navigator'}
        </h1>
        <p className="schemes-hero-sub">
          {isTa
            ? 'சிறு மற்றும் குறு விவசாயிகளுக்கான 100% சொட்டு நீர் பாசன மானியம், ₹6,000 நேரடி பண உதவி, பயிர் காப்பீடு மற்றும் டிராக்டர் மானிய திட்டங்களை எளிதாக சரிபார்த்து விண்ணப்பிக்கவும்.'
            : 'Explore verified welfare subsidies, 100% micro-irrigation grants, ₹6,000 DBT income assistance, crop insurance, and tractor mechanization schemes tailored for farmers.'}
        </p>
      </header>

      {/* Stats Ribbon */}
      <div className="schemes-stats-ribbon">
        <div className="scheme-stat-box">
          <div className="scheme-stat-icon">📜</div>
          <div>
            <h4 className="scheme-stat-val">{schemes.length}+ Active</h4>
            <p className="scheme-stat-lbl">{isTa ? 'அங்கீகரிக்கப்பட்ட திட்டங்கள்' : 'Verified Welfare Schemes'}</p>
          </div>
        </div>
        <div className="scheme-stat-box">
          <div className="scheme-stat-icon">💰</div>
          <div>
            <h4 className="scheme-stat-val">Up to 100%</h4>
            <p className="scheme-stat-lbl">{isTa ? 'பாசன & இடுபொருள் மானியம்' : 'Micro-Irrigation Subsidy'}</p>
          </div>
        </div>
        <div className="scheme-stat-box">
          <div className="scheme-stat-icon">📞</div>
          <div>
            <h4 className="scheme-stat-val">1800-180-1551</h4>
            <p className="scheme-stat-lbl">{isTa ? 'விவசாயி கட்டணமில்லா உதவி எண்' : 'Kisan Call Centre (Toll-Free)'}</p>
          </div>
        </div>
      </div>

      {/* Interactive Filter Panel (Smart Eligibility Check) */}
      <section className="schemes-filter-panel">
        <div className="schemes-filter-header">
          <h3 className="schemes-filter-title">
            <span>🔍</span>
            <span>{isTa ? 'திட்டங்களை வடிகட்டுக / தகுதி சரிபார்ப்பு' : 'Filter Schemes & Check Eligibility'}</span>
          </h3>
          {(department !== 'All' || category !== 'All' || landSize !== 'all' || search) && (
            <button
              type="button"
              className="btn btn-sm btn-link text-success text-decoration-none p-0"
              onClick={() => {
                setDepartment('All');
                setCategory('All');
                setLandSize('all');
                setSearch('');
              }}
            >
              {isTa ? 'வடிகட்டிகளை அழிக்க' : 'Reset all filters'}
            </button>
          )}
        </div>

        <div className="schemes-filter-grid">
          {/* Search box */}
          <div className="scheme-filter-field">
            <label className="scheme-filter-label">{isTa ? 'தேடல்' : 'Search'}</label>
            <input
              type="text"
              className="scheme-search-input"
              placeholder={isTa ? 'திட்டத்தின் பெயர் / திறவுச்சொல்...' : 'Search by scheme name, keywords...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department */}
          <div className="scheme-filter-field">
            <label className="scheme-filter-label">{isTa ? 'அரசு துறை' : 'Department'}</label>
            <select
              className="scheme-select-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">{isTa ? 'அனைத்து துறைகளும் (மத்திய & மாநிலம்)' : 'All (Central & State)'}</option>
              <option value="Central">{isTa ? '🇮🇳 மத்திய அரசு (Central)' : '🇮🇳 Central Government'}</option>
              <option value="State">{isTa ? '🏛️ தமிழக அரசு (Tamil Nadu)' : '🏛️ State - Tamil Nadu'}</option>
            </select>
          </div>

          {/* Land size selector */}
          <div className="scheme-filter-field">
            <label className="scheme-filter-label">{isTa ? 'நில அளவு (தகுதிக்கு)' : 'Land Holding Size'}</label>
            <select
              className="scheme-select-input"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
            >
              <option value="all">{isTa ? 'அனைத்து நில அளவுகள்' : 'All Land Sizes'}</option>
              <option value="marginal">{isTa ? 'குறு விவசாயி (< 2.5 ஏக்கர்)' : 'Marginal Farmer (< 2.5 Acres)'}</option>
              <option value="small">{isTa ? 'சிறு விவசாயி (2.5 – 5.0 ஏக்கர்)' : 'Small Farmer (2.5 - 5.0 Acres)'}</option>
              <option value="large">{isTa ? 'பெரிய விவசாயி (> 5.0 ஏக்கர்)' : 'Large Farmer (> 5.0 Acres)'}</option>
            </select>
          </div>
        </div>

        {/* Sector Category Pills */}
        <div className="schemes-category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'All' && (isTa ? 'அனைத்து துறைகள்' : 'All Sectors')}
              {cat === 'Income Support' && (isTa ? 'பண உதவி' : 'Income Support')}
              {cat === 'Irrigation' && (isTa ? 'பாசனம்' : 'Irrigation')}
              {cat === 'Machinery' && (isTa ? 'இயந்திரம்' : 'Machinery')}
              {cat === 'Insurance' && (isTa ? 'காப்பீடு' : 'Insurance')}
              {cat === 'Solar & Energy' && (isTa ? 'சூரிய சக்தி' : 'Solar & Energy')}
              {cat === 'Credit & Finance' && (isTa ? 'கடன் உதவி' : 'Credit & Finance')}
              {cat === 'Inputs & Seeds' && (isTa ? 'விதைகள்' : 'Inputs & Seeds')}
              {cat === 'Social Welfare' && (isTa ? 'சமூக நலன்' : 'Social Welfare')}
            </button>
          ))}
        </div>
      </section>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="schemes-cards-grid">
          {filteredSchemes.map((scheme) => {
            const titleText = isTa && scheme.titleTa ? scheme.titleTa : scheme.title;
            const descText = isTa && scheme.descriptionTa ? scheme.descriptionTa : scheme.description;
            const beneficiaryText =
              isTa && scheme.targetBeneficiaryTa ? scheme.targetBeneficiaryTa : scheme.targetBeneficiary;
            const isCentral = scheme.department === 'Central';

            return (
              <article className="scheme-card" key={scheme.schemeCode || scheme._id}>
                <div>
                  <div className="scheme-card-top">
                    <span className={`scheme-dept-tag ${isCentral ? 'central' : 'state'}`}>
                      {isCentral ? '🇮🇳 Central' : '🏛️ Tamil Nadu'}
                    </span>
                    <span className="scheme-cat-tag">{scheme.category}</span>
                  </div>

                  <h3 className="scheme-title">{titleText}</h3>
                  <p className="scheme-desc">{descText}</p>

                  {/* Subsidy Highlight Box */}
                  <div className="scheme-benefit-box">
                    <div>
                      <span className="d-block small text-muted">
                        {isTa ? 'மானியம் / உதவி:' : 'Subsidy / Benefit:'}
                      </span>
                      <span className="scheme-subsidy-val">{scheme.subsidyRate}</span>
                    </div>
                    {scheme.maxBenefit && <span className="scheme-max-val">{scheme.maxBenefit}</span>}
                  </div>

                  {beneficiaryText && (
                    <div className="scheme-beneficiary-row">
                      <span>🎯</span>
                      <span>{beneficiaryText}</span>
                    </div>
                  )}
                </div>

                <div className="scheme-card-actions">
                  <button
                    type="button"
                    className="btn-scheme-details"
                    onClick={() => handleOpenModal(scheme)}
                  >
                    <span>📋</span>
                    <span>{isTa ? 'தகுதி & ஆவணங்கள்' : 'Check Eligibility & Docs'}</span>
                  </button>
                  {scheme.officialPortalUrl && (
                    <a
                      href={scheme.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-scheme-apply"
                      title={isTa ? 'அரசு தளம் செல்ல' : 'Apply on Official Govt Portal'}
                    >
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="schemes-empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌾</div>
          <h4>{isTa ? 'பொருத்தமான திட்டங்கள் இல்லை' : 'No matching schemes found'}</h4>
          <p className="text-muted">
            {isTa
              ? 'வேறு வடிகட்டிகள் அல்லது தேடல் சொற்களை முயற்சி செய்து பார்க்கவும்.'
              : 'Try adjusting your land holding size or category filter.'}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-success px-3 mt-2"
            onClick={() => {
              setDepartment('All');
              setCategory('All');
              setLandSize('all');
              setSearch('');
            }}
          >
            {isTa ? 'அனைத்து திட்டங்களையும் காண்க' : 'View all schemes'}
          </button>
        </div>
      )}

      {/* Modal: Document Checklist & Application Readiness */}
      {selectedScheme && (
        <div className="scheme-modal-backdrop" onClick={() => setSelectedScheme(null)}>
          <div className="scheme-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="scheme-modal-header">
              <div>
                <span className="badge bg-light text-success border mb-1">
                  {selectedScheme.schemeCode}
                </span>
                <h3 className="scheme-modal-title">
                  {isTa && selectedScheme.titleTa ? selectedScheme.titleTa : selectedScheme.title}
                </h3>
              </div>
              <button
                type="button"
                className="scheme-modal-close"
                onClick={() => setSelectedScheme(null)}
              >
                ✕
              </button>
            </div>

            <div className="scheme-modal-body">
              {/* Subsidy Banner */}
              <div className="p-3 rounded bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">{isTa ? 'அரசு மானிய விகிதம்' : 'Government Subsidy'}</small>
                  <strong className="text-success fs-6">{selectedScheme.subsidyRate}</strong>
                </div>
                {selectedScheme.maxBenefit && (
                  <span className="badge bg-success px-2 py-1">{selectedScheme.maxBenefit}</span>
                )}
              </div>

              {/* Document Readiness Meter */}
              <div className="readiness-meter-box">
                <div className="readiness-meter-head">
                  <h4 className="readiness-title">
                    📄 {isTa ? 'விண்ணப்ப ஆவணங்கள் தயார் நிலை' : 'Application Document Readiness'}
                  </h4>
                  <span className="readiness-pct">{readinessPercent}%</span>
                </div>
                <div className="readiness-progress-bar-bg">
                  <div
                    className="readiness-progress-bar-fill"
                    style={{ width: `${readinessPercent}%` }}
                  />
                </div>
                <p className="readiness-tip">
                  {checkedCount} / {totalDocs} {isTa ? 'ஆவணங்கள் தயாராக உள்ளன.' : 'documents checked.'}{' '}
                  {readinessPercent === 100
                    ? isTa
                      ? '🎉 அனைத்து ஆவணங்களும் தயார்! இ-சேவை அல்லது அரசு தளத்தில் விண்ணப்பிக்கலாம்.'
                      : '🎉 All documents ready! You are prepared to apply at your e-Sevai / VAO.'
                    : isTa
                    ? 'விண்ணப்பிக்க தேவையான ஆவணங்களை சரிபார்க்கவும்.'
                    : 'Check off each document as you prepare it.'}
                </p>
              </div>

              {/* Checklist Items */}
              <div>
                <h5 className="fs-6 fw-bold mb-2 text-dark">
                  {isTa ? 'தேவையான ஆவணங்கள் பட்டியல்' : 'Required Documents Checklist'}:
                </h5>
                <div className="checklist-group">
                  {(isTa && selectedScheme.requiredDocumentsTa?.length
                    ? selectedScheme.requiredDocumentsTa
                    : selectedScheme.requiredDocuments || []
                  ).map((doc, idx) => {
                    const isChecked = !!checkedDocs[idx];
                    return (
                      <label
                        key={idx}
                        className={`checklist-item ${isChecked ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleDoc(idx);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDoc(idx)}
                        />
                        <span className="checklist-item-text">{doc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h5 className="fs-6 fw-bold mb-2 text-dark">
                  {isTa ? 'தகுதி வரம்புகள்' : 'Eligibility Criteria'}:
                </h5>
                <ul className="eligibility-list">
                  {(isTa && selectedScheme.eligibilityCriteriaTa?.length
                    ? selectedScheme.eligibilityCriteriaTa
                    : selectedScheme.eligibilityCriteria || []
                  ).map((crit, idx) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
              </div>

              {/* Deadline / Application Notes */}
              {selectedScheme.deadlineInfo && (
                <div className="p-2 px-3 rounded bg-warning bg-opacity-10 border border-warning text-dark small">
                  <strong>⏱ {isTa ? 'காலக்கெடு / குறிப்பு:' : 'Application Deadline:'} </strong>
                  {selectedScheme.deadlineInfo}
                </div>
              )}
            </div>

            <div className="scheme-modal-footer">
              {selectedScheme.helpline ? (
                <a className="helpline-link" href={`tel:${selectedScheme.helpline}`}>
                  <span>📞</span>
                  <span>
                    {isTa ? 'உதவி எண்' : 'Helpline'}: {selectedScheme.helpline}
                  </span>
                </a>
              ) : <div />}

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedScheme(null)}
                >
                  {isTa ? 'மூடுக' : 'Close'}
                </button>
                {selectedScheme.officialPortalUrl && (
                  <a
                    href={selectedScheme.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-success px-3 fw-semibold"
                  >
                    {isTa ? 'அரசு தளத்தில் விண்ணப்பிக்க ↗' : 'Apply on Official Portal ↗'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
