import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.config.js';
import Medication from '../models/Medication.js';

dotenv.config();

const DEFAULT_TARGET = 500;
const MAX_TARGET = 5000;

const manufacturers = [
  'DHG Pharma',
  'Traphaco',
  'Imexpharm',
  'Pymepharco',
  'Vidipha',
  'Sanofi',
  'GSK',
  'Pfizer',
  'Bayer',
  'Novartis',
  'AstraZeneca',
  'Servier',
  'Abbott',
  'Merck',
  'Stada',
  'Domesco',
  'Mekophar',
  'OPC Pharma',
  'Hasan-Dermapharm',
  'SaviPharm',
];

const countries = ['Viet Nam', 'France', 'Germany', 'USA', 'UK', 'India', 'Japan', 'Korea'];

const catalog = [
  { name: 'Paracetamol', category: 'Giam dau - ha sot', route: 'oral', forms: ['tablet', 'capsule', 'syrup'], strengths: ['500mg', '650mg', '250mg/5ml'], min: 200, max: 1200 },
  { name: 'Ibuprofen', category: 'Khang viem giam dau NSAID', route: 'oral', forms: ['tablet', 'capsule', 'syrup'], strengths: ['200mg', '400mg', '100mg/5ml'], min: 500, max: 2500 },
  { name: 'Diclofenac', category: 'Khang viem giam dau NSAID', route: 'oral', forms: ['tablet', 'capsule', 'injection'], strengths: ['50mg', '75mg', '75mg/3ml'], min: 900, max: 4000 },
  { name: 'Meloxicam', category: 'Khang viem giam dau NSAID', route: 'oral', forms: ['tablet', 'capsule'], strengths: ['7.5mg', '15mg'], min: 1400, max: 5000 },
  { name: 'Celecoxib', category: 'Khang viem giam dau NSAID', route: 'oral', forms: ['capsule', 'tablet'], strengths: ['100mg', '200mg'], min: 2500, max: 9000 },
  { name: 'Amoxicillin', category: 'Khang sinh beta-lactam', route: 'oral', forms: ['capsule', 'tablet', 'syrup'], strengths: ['250mg', '500mg', '250mg/5ml'], min: 700, max: 3000 },
  { name: 'Amoxicillin + Clavulanate', category: 'Khang sinh beta-lactam', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['500/125mg', '875/125mg', '250/62.5mg/5ml'], min: 1800, max: 7000 },
  { name: 'Cefuroxime', category: 'Khang sinh cephalosporin', route: 'oral', forms: ['tablet', 'capsule'], strengths: ['250mg', '500mg'], min: 3500, max: 12000 },
  { name: 'Cefixime', category: 'Khang sinh cephalosporin', route: 'oral', forms: ['tablet', 'capsule', 'syrup'], strengths: ['200mg', '400mg', '100mg/5ml'], min: 3000, max: 11000 },
  { name: 'Azithromycin', category: 'Khang sinh macrolide', route: 'oral', forms: ['tablet', 'capsule', 'syrup'], strengths: ['250mg', '500mg', '200mg/5ml'], min: 2200, max: 9000 },
  { name: 'Clarithromycin', category: 'Khang sinh macrolide', route: 'oral', forms: ['tablet', 'capsule'], strengths: ['250mg', '500mg'], min: 2800, max: 10000 },
  { name: 'Levofloxacin', category: 'Khang sinh quinolone', route: 'oral', forms: ['tablet', 'solution'], strengths: ['500mg', '750mg', '5mg/ml'], min: 3500, max: 14000 },
  { name: 'Metronidazole', category: 'Khang sinh - ky sinh trung', route: 'oral', forms: ['tablet', 'capsule', 'solution'], strengths: ['250mg', '500mg', '5mg/ml'], min: 800, max: 4500 },
  { name: 'Omeprazole', category: 'Da day - tieu hoa', route: 'oral', forms: ['capsule', 'tablet'], strengths: ['20mg', '40mg'], min: 1200, max: 5000 },
  { name: 'Esomeprazole', category: 'Da day - tieu hoa', route: 'oral', forms: ['capsule', 'tablet'], strengths: ['20mg', '40mg'], min: 2200, max: 8000 },
  { name: 'Pantoprazole', category: 'Da day - tieu hoa', route: 'oral', forms: ['tablet', 'injection'], strengths: ['40mg', '40mg/10ml'], min: 2000, max: 8500 },
  { name: 'Domperidone', category: 'Da day - tieu hoa', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['10mg', '1mg/ml'], min: 700, max: 3000 },
  { name: 'Loperamide', category: 'Da day - tieu hoa', route: 'oral', forms: ['capsule', 'tablet'], strengths: ['2mg'], min: 300, max: 1500 },
  { name: 'Oral Rehydration Salts', category: 'Da day - tieu hoa', route: 'oral', forms: ['powder'], strengths: ['goi 4.1g', 'goi 20.5g'], min: 200, max: 900 },
  { name: 'Cetirizine', category: 'Di ung', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['10mg', '5mg/5ml'], min: 500, max: 2500 },
  { name: 'Loratadine', category: 'Di ung', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['10mg', '5mg/5ml'], min: 500, max: 2200 },
  { name: 'Fexofenadine', category: 'Di ung', route: 'oral', forms: ['tablet', 'capsule'], strengths: ['60mg', '120mg', '180mg'], min: 1800, max: 6000 },
  { name: 'Montelukast', category: 'Hen - di ung', route: 'oral', forms: ['tablet', 'powder'], strengths: ['4mg', '5mg', '10mg'], min: 2200, max: 8000 },
  { name: 'Salbutamol', category: 'Ho hap', route: 'inhalation', forms: ['solution', 'syrup', 'tablet'], strengths: ['2mg', '4mg', '2mg/5ml'], min: 700, max: 3500 },
  { name: 'Budesonide', category: 'Ho hap', route: 'inhalation', forms: ['solution', 'powder'], strengths: ['0.5mg/2ml', '1mg/2ml', '200mcg'], min: 3500, max: 12000 },
  { name: 'Dextromethorphan', category: 'Ho hap', route: 'oral', forms: ['syrup', 'tablet'], strengths: ['15mg/5ml', '30mg'], min: 600, max: 3000 },
  { name: 'Acetylcysteine', category: 'Ho hap', route: 'oral', forms: ['powder', 'solution'], strengths: ['200mg', '600mg', '100mg/ml'], min: 1300, max: 6000 },
  { name: 'Amlodipine', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['5mg', '10mg'], min: 700, max: 2500 },
  { name: 'Perindopril', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['4mg', '8mg'], min: 1300, max: 4500 },
  { name: 'Losartan', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['50mg', '100mg'], min: 900, max: 3500 },
  { name: 'Valsartan', category: 'Tim mach', route: 'oral', forms: ['tablet', 'capsule'], strengths: ['80mg', '160mg'], min: 1500, max: 6000 },
  { name: 'Bisoprolol', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['2.5mg', '5mg'], min: 900, max: 3000 },
  { name: 'Atorvastatin', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['10mg', '20mg', '40mg'], min: 1200, max: 5500 },
  { name: 'Rosuvastatin', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['5mg', '10mg', '20mg'], min: 1800, max: 7000 },
  { name: 'Aspirin', category: 'Tim mach', route: 'oral', forms: ['tablet'], strengths: ['81mg', '100mg'], min: 300, max: 1500 },
  { name: 'Metformin', category: 'Noi tiet - dai thao duong', route: 'oral', forms: ['tablet'], strengths: ['500mg', '850mg', '1000mg'], min: 400, max: 1800 },
  { name: 'Gliclazide', category: 'Noi tiet - dai thao duong', route: 'oral', forms: ['tablet'], strengths: ['30mg', '60mg', '80mg'], min: 700, max: 2800 },
  { name: 'Sitagliptin', category: 'Noi tiet - dai thao duong', route: 'oral', forms: ['tablet'], strengths: ['50mg', '100mg'], min: 5500, max: 16000 },
  { name: 'Insulin Glargine', category: 'Noi tiet - dai thao duong', route: 'injection', forms: ['injection'], strengths: ['100IU/ml'], min: 18000, max: 42000 },
  { name: 'Levothyroxine', category: 'Noi tiet', route: 'oral', forms: ['tablet'], strengths: ['25mcg', '50mcg', '100mcg'], min: 1000, max: 4000 },
  { name: 'Calcium Carbonate', category: 'Co xuong khop', route: 'oral', forms: ['tablet', 'powder'], strengths: ['500mg', '600mg'], min: 500, max: 2200 },
  { name: 'Vitamin D3', category: 'Vitamin - khoang chat', route: 'oral', forms: ['capsule', 'drops'], strengths: ['400IU', '1000IU', '2000IU'], min: 400, max: 3500 },
  { name: 'Vitamin C', category: 'Vitamin - khoang chat', route: 'oral', forms: ['tablet', 'powder'], strengths: ['500mg', '1000mg'], min: 300, max: 2000 },
  { name: 'Multivitamin', category: 'Vitamin - khoang chat', route: 'oral', forms: ['tablet', 'capsule', 'syrup'], strengths: ['tong hop'], min: 1000, max: 4500 },
  { name: 'Ferrous Sulfate', category: 'Huyet hoc', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['60mg', '100mg', '25mg/5ml'], min: 600, max: 3000 },
  { name: 'Folic Acid', category: 'Huyet hoc', route: 'oral', forms: ['tablet'], strengths: ['5mg'], min: 200, max: 900 },
  { name: 'Methylprednisolone', category: 'Noi tiet - khang viem', route: 'oral', forms: ['tablet', 'injection'], strengths: ['4mg', '16mg', '40mg/ml'], min: 1200, max: 9000 },
  { name: 'Prednisolone', category: 'Noi tiet - khang viem', route: 'oral', forms: ['tablet', 'syrup'], strengths: ['5mg', '15mg/5ml'], min: 900, max: 4500 },
  { name: 'Hydrocortisone', category: 'Da lieu', route: 'topical', forms: ['cream', 'ointment'], strengths: ['1%', '2.5%'], min: 1800, max: 7000 },
  { name: 'Clotrimazole', category: 'Da lieu', route: 'topical', forms: ['cream', 'ointment', 'solution'], strengths: ['1%'], min: 1500, max: 6500 },
  { name: 'Ketoconazole', category: 'Da lieu', route: 'topical', forms: ['cream', 'solution'], strengths: ['2%'], min: 1800, max: 7500 },
  { name: 'Mupirocin', category: 'Da lieu', route: 'topical', forms: ['ointment', 'cream'], strengths: ['2%'], min: 4500, max: 12000 },
  { name: 'Ofloxacin', category: 'Mat - tai mui hong', route: 'topical', forms: ['drops', 'solution'], strengths: ['0.3%'], min: 3000, max: 10000 },
  { name: 'Ciprofloxacin', category: 'Mat - tai mui hong', route: 'topical', forms: ['drops', 'solution'], strengths: ['0.3%'], min: 2800, max: 9500 },
  { name: 'Xylometazoline', category: 'Tai mui hong', route: 'topical', forms: ['drops', 'solution'], strengths: ['0.05%', '0.1%'], min: 1000, max: 4000 },
  { name: 'Natri Clorid', category: 'Tai mui hong', route: 'topical', forms: ['drops', 'solution'], strengths: ['0.9%'], min: 400, max: 1500 },
  { name: 'Tranexamic Acid', category: 'Huyet hoc', route: 'oral', forms: ['tablet', 'injection'], strengths: ['250mg', '500mg', '100mg/ml'], min: 1500, max: 8000 },
  { name: 'Ringer Lactate', category: 'Truyen dich', route: 'iv', forms: ['solution'], strengths: ['500ml', '1000ml'], min: 12000, max: 45000 },
  { name: 'Natri Clorid Truyen', category: 'Truyen dich', route: 'iv', forms: ['solution'], strengths: ['500ml', '1000ml'], min: 9000, max: 36000 },
  { name: 'Glucose Truyen', category: 'Truyen dich', route: 'iv', forms: ['solution'], strengths: ['5% 500ml', '10% 500ml'], min: 10000, max: 38000 },
  { name: 'Ondansetron', category: 'Chong non', route: 'oral', forms: ['tablet', 'injection'], strengths: ['4mg', '8mg', '2mg/ml'], min: 2800, max: 12000 },
  { name: 'Meclizine', category: 'Chong non - chong chong mat', route: 'oral', forms: ['tablet'], strengths: ['25mg'], min: 1000, max: 4500 },
];

const sideEffectsPool = [
  'Buon non',
  'Chong mat',
  'Dau dau',
  'Kho mieng',
  'Buon ngu',
  'Noi me day',
  'Kho tieu',
  'Tieu chay',
  'Tao bon',
  'Tang men gan',
];

const contraindicationsPool = [
  'Qua man voi thanh phan thuoc',
  'Suy gan nang',
  'Suy than nang',
  'Phu nu co thai 3 thang dau',
  'Tre duoi 2 tuoi (can than)',
  'Tien su loet da day dang tien trien',
];

const interactionsPool = [
  'Ruou bia',
  'Thuoc chong dong',
  'Thuoc ha duong huyet',
  'NSAID khac',
  'Macrolide',
  'Thuoc loi tieu',
  'Corticosteroid',
  'Khang acid',
];

const formToUnit = {
  tablet: 'vien',
  capsule: 'vien nang',
  syrup: 'ml',
  injection: 'ong',
  cream: 'tuyp',
  ointment: 'tuyp',
  drops: 'chai',
  powder: 'goi',
  solution: 'chai',
};

const routeToVN = {
  oral: 'Duong uong',
  iv: 'Truyen tinh mach',
  im: 'Tiem bap',
  topical: 'Dung ngoai',
  inhalation: 'Khi dung',
  other: 'Khac',
};

const toTitle = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomPick = (arr) => arr[randomInt(0, arr.length - 1)];

const pickMany = (arr, min = 1, max = 2) => {
  const count = randomInt(min, max);
  const pool = [...arr];
  const selected = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    const idx = randomInt(0, pool.length - 1);
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return selected;
};

const parseAmountUnit = (strength) => {
  if (!strength) return { amount: 0, unit: 'mg' };
  const match = String(strength).match(/([0-9]+(?:\.[0-9]+)?)\s*(mg|mcg|g|iu|IU|ml|%)/);
  if (!match) return { amount: 0, unit: 'mg' };
  return { amount: Number(match[1]), unit: match[2].toUpperCase() === 'IU' ? 'IU' : match[2] };
};

const formSuffixVN = {
  tablet: 'Vien nen',
  capsule: 'Vien nang',
  syrup: 'Siro',
  injection: 'Tiem',
  cream: 'Kem boi',
  ointment: 'Thuoc mo',
  drops: 'Nho',
  powder: 'Bot',
  solution: 'Dung dich',
};

const buildMedication = (index, target) => {
  const base = catalog[index % catalog.length];
  const form = base.forms[index % base.forms.length];
  const strength = base.strengths[index % base.strengths.length];
  const manufacturer = manufacturers[index % manufacturers.length];
  const country = countries[index % countries.length];
  const dosesPerBoxOptions = [10, 20, 30, 50, 60, 100];
  const dosesPerBox = randomPick(dosesPerBoxOptions);
  const pricePerDose = randomInt(base.min, base.max);
  const stockBoxes = randomInt(5, 400);
  const stockDoses = randomInt(0, Math.max(10, dosesPerBox * 5));
  const code = `MED${String(index + 1).padStart(6, '0')}`;
  const sku = `SKU${String(index + 1).padStart(7, '0')}`;
  const shortManufacturer = manufacturer.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'GEN';
  const registrationNumber = `VD-${String(100000 + index).slice(-6)}-${String((index % 97) + 1).padStart(2, '0')}`;
  const amountUnit = parseAmountUnit(strength);

  const now = new Date();
  const batch1Expiry = new Date(now.getFullYear() + randomInt(1, 3), randomInt(0, 11), randomInt(1, 28));
  const batch2Expiry = new Date(now.getFullYear() + randomInt(2, 4), randomInt(0, 11), randomInt(1, 28));

  const name = `${base.name} ${strength} ${formSuffixVN[form] || toTitle(form)}`;

  return {
    code,
    sku,
    name,
    genericName: base.name,
    brandName: `${base.name.split(' ')[0]} ${shortManufacturer}`,
    activeIngredients: [
      {
        name: base.name,
        amount: amountUnit.amount,
        unit: amountUnit.unit,
      },
    ],
    category: base.category,
    dosageForm: form,
    strength,
    administrationRoute: base.route,
    manufacturer,
    countryOfOrigin: country,
    registrationNumber,
    prescriptionRequired: randomInt(0, 100) > 18,
    pricing: {
      pricePerDose,
      dosesPerBox,
      pricePerBox: pricePerDose * dosesPerBox,
      currency: 'VND',
    },
    inventory: {
      stockBoxes,
      stockDoses,
      reorderLevelBoxes: randomInt(5, 30),
      location: `KHO-${String((index % 12) + 1).padStart(2, '0')}-${(index % 4) + 1}`,
    },
    batches: [
      {
        batchNumber: `B${String(index + 1).padStart(5, '0')}A`,
        expiryDate: batch1Expiry,
        quantityBoxes: randomInt(10, 80),
        quantityDoses: randomInt(0, 100),
        importPricePerBox: Math.round((pricePerDose * dosesPerBox) * 0.72),
      },
      {
        batchNumber: `B${String(index + 1).padStart(5, '0')}B`,
        expiryDate: batch2Expiry,
        quantityBoxes: randomInt(10, 80),
        quantityDoses: randomInt(0, 100),
        importPricePerBox: Math.round((pricePerDose * dosesPerBox) * 0.75),
      },
    ],
    indications: [
      `Dieu tri ${base.category.toLowerCase()}`,
      `Su dung theo chi dinh bac si cho ${base.name.toLowerCase()}`,
    ],
    contraindications: pickMany(contraindicationsPool, 1, 2),
    sideEffects: pickMany(sideEffectsPool, 2, 4),
    interactions: pickMany(interactionsPool, 1, 2),
    warnings: [
      `Khong tu y tang lieu ${formToUnit[form] || 'don vi'} moi ngay.`,
      'Doc ky huong dan su dung truoc khi dung.',
    ],
    status: stockBoxes === 0 && stockDoses === 0 ? 'out_of_stock' : 'active',
    notes: `Du lieu mau #${index + 1}/${target} cho quan ly kho va ke don thuoc.`,
  };
};

const seedMedications = async () => {
  const requested = Number(process.argv[2] || process.env.MED_SEED_COUNT || DEFAULT_TARGET);
  const target = Number.isFinite(requested)
    ? Math.min(Math.max(Math.floor(requested), 1), MAX_TARGET)
    : DEFAULT_TARGET;

  try {
    await connectDB();
    console.log(`\nDang seed du lieu thuoc... target = ${target}`);

    const medications = [];
    for (let i = 0; i < target; i += 1) {
      medications.push(buildMedication(i, target));
    }

    const operations = medications.map((item) => ({
      updateOne: {
        filter: { code: item.code },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await Medication.bulkWrite(operations, { ordered: false });

    const total = await Medication.countDocuments();
    const outOfStock = await Medication.countDocuments({ status: 'out_of_stock' });

    console.log('Seed thanh cong.');
    console.log(`- Upserted: ${result.upsertedCount || 0}`);
    console.log(`- Modified: ${result.modifiedCount || 0}`);
    console.log(`- Total medications in DB: ${total}`);
    console.log(`- Out of stock: ${outOfStock}`);
  } catch (error) {
    console.error('Seed thuoc that bai:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedMedications();
