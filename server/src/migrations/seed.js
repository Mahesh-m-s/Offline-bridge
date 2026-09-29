const bcrypt = require('bcryptjs');
const { pool, withTransaction } = require('../db/pool');

const forms = require('../data/service-forms.json').map((form) => ({
  key: form.service_type,
  title: form.title,
  titleKn: form.title_kn || '',
  category: form.category,
  schema: form
}));
const schemes = [
  ['pm_kisan','PM-Kisan Samman Nidhi','ಪಿಎಂ ಕಿಸಾನ್','Direct income support for eligible farmer families.','₹6,000 / year',{maxIncome:250000,maxLandAcres:5,allowedCategories:['All']}],
  ['rural_scholarship','Post-Matric Rural Youth Scholarship','ಗ್ರಾಮೀಣ ವಿದ್ಯಾರ್ಥಿವೇತನ','Tuition support and a maintenance stipend for eligible students.','Tuition support + monthly stipend',{minAge:16,maxAge:28,isStudent:true,maxIncome:250000,allowedCategories:['SC','ST','OBC','EWS']}],
  ['pmay_gramin','Pradhan Mantri Awas Yojana (Gramin)','ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ','Housing assistance for eligible rural households.','₹1,20,000 housing assistance',{maxIncome:150000,landOwnership:['Landless','Marginal'],hasPuccaHouse:false}],
  ['old_age_pension','National Old Age Pension Scheme','ರಾಷ್ಟ್ರೀಯ ವೃದ್ಧಾಪ್ಯ ಪಿಂಚಣಿ','Monthly pension support for senior citizens.','₹1,500 / month',{minAge:60,maxIncome:100000}],
  ['agri_equipment','Agricultural Equipment Modernization Subsidy','ಕೃಷಿ ಉಪಕರಣ ಸಬ್ಸಿಡಿ','Subsidy for eligible farm machinery and irrigation equipment.','Up to 50% subsidy',{occupations:['Farmer'],maxLandAcres:5,maxIncome:300000}],
  ['girl_education','Rural Girl Child Higher Education Grant','ಗ್ರಾಮೀಣ ಹೆಣ್ಣುಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ ಅನುದಾನ','One-time grant for eligible girl students entering higher education.','₹50,000 one-time',{isFemale:true,isStudent:true,maxIncome:300000,minAge:17,maxAge:24}]
];

async function seed() {
  await withTransaction(async (client) => {
    const passwordHash = await bcrypt.hash('rural123', 10);
    await client.query(`INSERT INTO users(name,phone,password_hash,role) VALUES ('Ramesh Gowda','9876543210',$1,'citizen') ON CONFLICT(phone) DO NOTHING`, [passwordHash]);
    const formIds = {};
    for (const form of forms) {
      const schema = form.schema;
      const result = await client.query(`INSERT INTO service_forms(service_key,title,title_kn,category,schema_json,version,is_active) VALUES($1,$2,$3,$4,$5,1,TRUE) ON CONFLICT(service_key) DO UPDATE SET title=EXCLUDED.title,title_kn=EXCLUDED.title_kn,category=EXCLUDED.category,schema_json=EXCLUDED.schema_json,is_active=TRUE,updated_at=NOW() RETURNING id`, [form.key,form.title,form.titleKn,form.category,JSON.stringify(schema)]);
      formIds[form.key] = result.rows[0].id;
    }
    for (const [key,name,nameKn,description,benefit,rules] of schemes) {
      await client.query(`INSERT INTO schemes(scheme_key,name,name_kn,description,eligibility_rules_json,benefit,is_active) VALUES($1,$2,$3,$4,$5,$6,TRUE) ON CONFLICT(scheme_key) DO UPDATE SET name=EXCLUDED.name,name_kn=EXCLUDED.name_kn,description=EXCLUDED.description,eligibility_rules_json=EXCLUDED.eligibility_rules_json,benefit=EXCLUDED.benefit,is_active=TRUE`, [key,name,nameKn,description,JSON.stringify(rules),benefit]);
    }
    const user = (await client.query("SELECT id FROM users WHERE phone='9876543210'")).rows[0];
    const statuses = ['pending','under_review','approved','rejected'];
    for (let i=0;i<statuses.length;i++) {
      const uuid = `00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`;
      await client.query(`INSERT INTO submissions(client_uuid,user_id,form_id,data_json,status,sync_status,reference_no,synced_at) VALUES($1,$2,$3,$4,$5,'synced',$6,NOW()) ON CONFLICT(client_uuid) DO NOTHING`, [uuid,user.id,formIds[forms[i].key],JSON.stringify({demo:true}),statuses[i],`OB-DEMO-S-${String(i+1).padStart(6,'0')}`]);
      if (i < 4) {
        const grievanceUuid = `10000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`;
        const grievanceStatus = ['open','in_progress','resolved','rejected'][i];
        await client.query(`INSERT INTO grievances(client_uuid,user_id,category,description,status,reference_no,synced_at) VALUES($1,$2,'Demo','Seeded example grievance',$3,$4,NOW()) ON CONFLICT(client_uuid) DO NOTHING`, [grievanceUuid,user.id,grievanceStatus,`OB-DEMO-G-${String(i+1).padStart(6,'0')}`]);
      }
    }
  });
  console.log('Seed data is ready. Demo login: 9876543210 / rural123');
}

if (require.main === module) seed().then(()=>pool.end()).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
module.exports = { seed };
