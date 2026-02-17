import { deleteUser, getUser, updateUser } from "../services/userService.js";


export async function getCurrentUserHandler(req, res){
    let id = parseInt(req.user.id);
    const user = await getUser(id);
    res.status(200).json(user);
}

export async function updateCurrentUserHandler(req, res) {
  let id = parseInt(req.user.id);
  const updates = {};
  if (req.body.email) updates.email = req.body.email;
  if (req.body.password) updates.password = req.body.password;

  const updatedUser = await updateUser(id, updates);
  res.status(200).json(updatedUser);
}

export async function deleteCurrentUserHandler(req, res) {
  let id = parseInt(req.user.id);
  await deleteUser(id);
  res.status(204).send();
}
