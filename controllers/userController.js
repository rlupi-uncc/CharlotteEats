const userService = require("../services/userService.js");


async function getCurrentUserHandler(req, res){
    let id = req.user.id;
    const user = await userService.getUser(id);
    res.status(200).json(user);
}

async function updateCurrentUserHandler(req, res) {
  let id = req.user.id;
  const updates = {};
  if (req.body.name) updates.username = req.body.username;
  if (req.body.email_change) updates.email = req.body.email;
  if (req.body.password && req.body.password == req.body.password_confirm) updates.password = req.body.password;

  const updatedUser = await userService.updateUser(id, updates);
  res.status(200).redirect("/profile");
}

async function deleteCurrentUserHandler(req, res) {
  let id = req.user.id;
  await userService.deleteUser(id);
  res.status(204).send();
}

module.exports = {getCurrentUserHandler, updateCurrentUserHandler, deleteCurrentUserHandler};