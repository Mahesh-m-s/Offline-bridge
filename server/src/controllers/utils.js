function pagination(query){const page=Math.max(1,Number.parseInt(query.page||1,10));const limit=Math.min(100,Math.max(1,Number.parseInt(query.limit||20,10)));return[page,limit];}
module.exports={pagination};
