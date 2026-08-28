const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uModel = require('../models/users');

const SALT_ROUNDS = 10;

function gerarToken(user) {
    return jwt.sign(
        {
            id: user.id,
            papel: user.papel 
        },
    process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
}

async function registro(req, res, next) {
    try {
        const { nome, email, senha } = req.body;

        const existe = await uModel.buscarPorEmail(email);
        if (existe) {
            return res.status(409).json({
                erro: 'E-mail já cadastrado'
            })
        }

        const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);
        const user =  await uModel.criar({ nome, email, senha_hash });
        const token = gerarToken(user);

        res.status(201).json({ user, token })
    } catch (err) {
        next(err)
    }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    const user = await uModel.buscarPorEmail(email);
    if (!user) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = gerarToken(user);
    const { senha_hash, ...userSemSenha } = user;

    res.json({ user: userSemSenha, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await uModel.buscarPorId(req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { registro, login, me };
