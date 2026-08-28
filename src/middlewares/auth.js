const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            erro: 'Token não fornecido'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next();
    } catch (err) {
        return res.status(401).json({
            erro: 'Token inválido'
        })
    }
}

function somenteAdmin(req, res, next) {
    if (req.user?.papel !== 'admin') {
        return res.status(403).json({
            erro: 'Acesso restrito'
        })
    }
    next();
} 

module.exports = { autenticar, somenteAdmin};