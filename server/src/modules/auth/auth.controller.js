import { registerCitizen, login, createPrivilegedUser } from './auth.service.js';

export async function handleRegister(req, res, next) {
  try {
    const { fullName, phone, password, villagePanchayat } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await registerCitizen({
      fullName,
      phone,
      password,
      villagePanchayat,
      ipAddress
    });

    res.status(201).json({
      success: true,
      data: result.user,
      token: result.token
    });
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await login({
      identifier,
      password,
      ipAddress
    });

    res.status(200).json({
      success: true,
      data: result.user,
      token: result.token
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMe(req, res) {
  res.status(200).json({
    success: true,
    data: req.user
  });
}

export async function handleCreatePrivilegedUser(req, res, next) {
  try {
    const { fullName, phone, role, password, villagePanchayat } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const user = await createPrivilegedUser({
      fullName,
      phone,
      role,
      password,
      villagePanchayat,
      creatorAdminId: req.user.id,
      ipAddress
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
}

