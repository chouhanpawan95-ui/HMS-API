const mongoose = require('mongoose');
const UserAuthTypeMenuPermissionDetail = require('./models/userauthtypemenupermissiondetail');
const MenuMaster = require('./models/menumaster');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hmsdb', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('connected');
    const auth = 'AUTHTYPE0001';

    const u = await UserAuthTypeMenuPermissionDetail.find({ FK_AuthTypeId: auth }).lean();
    console.log('user auth perms count', u.length);
    if (u.length > 0) console.log('sample:', u[0]);

    const menuIds = u.map(r => r.FK_MenuId);
    const menus = await MenuMaster.find({ PK_MenuId: { $in: menuIds }, IsActive: true }).lean();
    console.log('matched menus count', menus.length);
    if (menus.length > 0) console.log('first menu:', menus[0]);

    const joined = await UserAuthTypeMenuPermissionDetail.aggregate([
      { $match: { FK_AuthTypeId: auth } },
      { $lookup: { from: 'menumasters', localField: 'FK_MenuId', foreignField: 'PK_MenuId', as: 'menu' } },
      { $unwind: '$menu' },
      { $match: { 'menu.IsActive': true } },
      { $project: { _id: 0, FK_MenuId: 1, FK_AuthTypeId: 1, menu: 1 } }
    ]);
    console.log('aggregate join count', joined.length);
    if (joined.length > 0) console.log('joined sample:', joined[0]);
  } catch (e) {
    console.error('error:', e);
  } finally {
    await mongoose.disconnect();
  }
})();