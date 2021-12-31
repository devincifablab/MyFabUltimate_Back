module.exports.addTestRoles = async (db, executeQuery) => {
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_isProtected`) VALUES ('roleIsProtected', 'Role to test the \"isProtected\" authorization', '000000', '1')", []);
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_viewUsers`) VALUES ('roleViewUsers', 'Role to test the \"viewUsers\" authorization', '000000', '1')", []);
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_manageUser`) VALUES ('roleManageUser', 'Role to test the \"manageUser\" authorization', '000000', '1')", []);
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_changeUserRole`) VALUES ('roleChangeUserRole', 'Role to test the \"changeUserRole\" authorization', '000000', '1')", []);
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_changeUserProtectedRole`) VALUES ('roleChangeUserProtectedRole', 'Role to test the \"changeUserProtectedRole\" authorization', '000000', '1')", []);
    await executeQuery(db, "INSERT INTO `gd_roles` (`v_name`, `v_description`, `v_color`, `b_myFabAgent`) VALUES ('roleMyFabAgent', 'Role to test the \"myFabAgent\" authorization', '000000', '1')", []);
    
    return;
}