const userService = require("../services/userService.js");


async function getCurrentUserHandler(req, res){
    let id = req.user.id;
    const user = await userService.getUser(id);
    res.status(200).json(user);
}

async function updateCurrentUserHandler(req, res) {
  const id = req.user.id;
  const updates = {};

  if (req.body.name) updates.username = req.body.name;
  if (req.body.email_change) updates.email = req.body.email_change;

  if (req.body.password) {
    if (req.body.password !== req.body.confirm_password) {
      return res.status(400).send("Passwords do not match");
    }
    updates.password = req.body.password;
  }

  const updatedUser = await userService.updateUser(id, updates);
  if (!updatedUser) {
    return res.status(404).send("User not found");
  }

  return res.redirect("/profile");
}

async function deleteCurrentUserHandler(req, res) {
  let id = req.user.id;
  await userService.deleteUser(id);
  res.status(204).send();
}

module.exports = {getCurrentUserHandler, updateCurrentUserHandler, deleteCurrentUserHandler};