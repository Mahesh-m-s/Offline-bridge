import { getUserById, listUsers, updateUser } from './users.service.js';

export async function handleGetUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: `User with ID '${id}' was not found.`, code: 'USER_NOT_FOUND' }
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function handleListUsers(req, res, next) {
  try {
    const { role, limit, offset } = req.query;
    const result = await listUsers({ role, limit, offset });
    res.status(200).json({ success: true, data: result.users, total: result.total });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateUser(req, res, next) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const updated = await updateUser(id, req.body, req.user, ipAddress);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

