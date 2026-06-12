const jwt = require('jsonwebtoken');
const Doctor = require('../modals/Doctor');
const Patient = require('../modals/Patient');

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            const header = req.headers.authorization;
            if(!header || !header.startsWith('Bearer ')) return console.log('token is not provided')
                
            const token = header.startsWith('Bearer ') ? header.slice(7) : null;

            if(!token) return res.unauthorized('Token is not provided')
           
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            req.auth = decode;

            if(decode.type === 'doctor') {
                req.user = await Doctor.findById(decode.id);
            } else if(decode.type === 'patient') {
                req.user = await Patient.findById(decode.id);
            }

            if(!req.user) return res.unauthorized('Invalid User')
            next();
        } catch (error) {
            return res.unauthorized('Invalid or Expired token')
        }
    },
    requireRole : role => (req, res, next) => {
        if(!req.auth || req.auth.type !== role) {
            return res.forbidden('Access Denied')
        }
        next();
    }
}