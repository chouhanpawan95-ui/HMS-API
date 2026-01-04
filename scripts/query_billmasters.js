(async ()=>{
  try{
    const { sequelize } = require('../config/pgdb');
    const pg = require('../models/pg');
    if(!pg.BillMaster){ console.log('Pg BillMaster not initialized'); process.exit(0); }
    const rows = await pg.BillMaster.findAll({ order:[['createdAt','DESC']], limit:5 });
    console.log(JSON.stringify(rows.map(r=>r.toJSON()),null,2));
    process.exit(0);
  }catch(err){ console.error(err); process.exit(1); }
})();