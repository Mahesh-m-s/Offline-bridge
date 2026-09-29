const {randomUUID}=require('node:crypto');
const bcrypt=require('bcryptjs');
const store={users:[],forms:[],schemes:[],submissions:[],grievances:[]};
function seedCatalog(){
  if(!store.forms.length)store.forms.push(...require('../data/service-forms.json').map((form)=>({id:randomUUID(),service_key:form.service_type,title:form.title,title_kn:form.title_kn||'',category:form.category,schema_json:form,version:1,is_active:true,updated_at:new Date().toISOString()})));
  if(!store.schemes.length)store.schemes.push(...[
    ['pm_kisan','PM-Kisan Samman Nidhi'],['rural_scholarship','Post-Matric Rural Youth Scholarship'],['pmay_gramin','Pradhan Mantri Awas Yojana (Gramin)'],['old_age_pension','National Old Age Pension Scheme'],['agri_equipment','Agricultural Equipment Modernization Subsidy'],['girl_education','Rural Girl Child Higher Education Grant']
  ].map(([scheme_key,name])=>({id:randomUUID(),scheme_key,name,name_kn:'',description:'Seeded demo scheme',eligibility_rules_json:{},benefit:'See eligibility details',is_active:true})));
  if(!store.users.length)store.users.push({id:randomUUID(),name:'Ramesh Gowda',phone:'9876543210',password_hash:bcrypt.hashSync('rural123',10),role:'citizen',created_at:new Date().toISOString()});
  if(!store.submissions.length){const user=store.users[0];['pending','under_review','approved','rejected'].forEach((status,i)=>store.submissions.push({id:randomUUID(),client_uuid:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,user_id:user.id,form_id:store.forms[i].id,data_json:{demo:true},status,sync_status:'synced',reference_no:`OB-DEMO-S-${String(i+1).padStart(6,'0')}`,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),synced_at:new Date().toISOString()}));}
  if(!store.grievances.length){const user=store.users[0];['open','in_progress','resolved','rejected'].forEach((status,i)=>store.grievances.push({id:randomUUID(),client_uuid:`10000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,user_id:user.id,category:'Demo',description:'Seeded example grievance',status,reference_no:`OB-DEMO-G-${String(i+1).padStart(6,'0')}`,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),synced_at:new Date().toISOString()}));}
}
module.exports={store,seedCatalog};
