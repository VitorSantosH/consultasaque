const mongoose = require('mongoose');
const userSchema = require('../models/userSchema');
const conn = require('../config/mongoConfig.js');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple')
const routesUsers = require('express').Router();
const Users = conn.model('UserFgts', userSchema);
const solicitacaoSchema = require('../models/solicitacaoSchema');
const Solicitacao = conn.model("userSolivitcacao", solicitacaoSchema)
const { authSecret } = require('../config/secret.js');


const newSolicitacao = async (req, res,) => {

    const salt = await bcrypt.genSalt(10);
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const UserAlreadyExists = await Solicitacao.findOne({ email: email })

    if (!UserAlreadyExists) {
        const newUser = await Solicitacao.create({
            email: email,
            password: hashedPassword,
            role: req.body.role,
            name: req.body.name,
            tel: req.body.tel,
            msg: req.body.msg
        })

        return res.status(200).send(newUser)

    } else {

        return res.status(400).send("Este e-mail já esta em uso.")
    }
}

const getSolicitacoes = async (req, res, next) => {

    const userReq = JSON.parse(req.body.user)
    try {

        const decoded = jwt.decode(userReq.token, authSecret)

    } catch (error) {

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.send(err)
    }

    try {
        const user = await Users.findOne({ _id: userReq.id });

        if (user.role != "admin") return res.status(400).send("Não autorizado");

    } catch (error) {

        return res.status(400).send("Não autorizado");

    }

    const solicitacao = await Solicitacao.find({})
    return res.send(solicitacao)
}

const avlSolicitacao = async (req, res) => {

    console.log(req.body)

    const userReq = req.body.user

    try {
        const decoded = jwt.decode(userReq.token, authSecret)
    } catch (error) {

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.send(err)
    }

    try {
        const user = await Users.findOne({ _id: userReq.id });

        if (user.role != "admin") return res.status(400).send("Não autorizado");

    } catch (error) {
        return res.status(400).send("Não autorizado");
    }

    try {
        if (!req.body.aceito) {

            Solicitacao.deleteOne({ email: req.body.newUser.email })
                .then(result => {
                    console.log(result)
                    if (result.deletedCount === 1) {
                        return res.status(200).json({ msg: "Solicitação removida com sucesso!" });
                    } else {
                        return res.status(404).json({ msg: "Solicitação não encontrada." });
                    }
                })
                .catch(error => {
                    console.error("Erro ao excluir solicitação:", error);
                    return res.status(500).json({ msg: "Erro interno do servidor." });
                });

        } else {

            Solicitacao.deleteOne({ email: req.body.newUser.email })
                .then(result => {
                    console.log(result)
                })
                .catch(error => {
                    console.error("Erro ao excluir solicitação:", error);
                });



            const email = req.body.newUser.email;
            const UserAlreadyExists = await Users.findOne({ email: email })

            if (!UserAlreadyExists) {
                const newUser = await Users.create({
                    email: email,
                    password: req.body.newUser.password,
                    role: req.body.newUser.role,
                    name: req.body.newUser.name,
                    tel: req.body.newUser.tel
                })
                return res.send(newUser)
            } else {

                return res.send("Usuário já existe!")
            }
        }
    } catch (error) {
        console.log(error)
    }



}

const generateUser = async (req, res, next) => {

    console.log(req.body)

    const salt = await bcrypt.genSalt(10);
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const UserAlreadyExists = await Users.findOne({ email: email })

    if (!UserAlreadyExists) {
        const newUser = await Users.create({
            email: email,
            password: hashedPassword,
            role: req.body.role,
            name: req.body.name,
            tel: req.body.tel
        })
        return res.send(newUser)
    } else {

        return res.send("Usuário já existe!")
    }


}

const updateUser = async (req, res,) => {


    let decoded = {}

    try {

        decoded = jwt.decode(req.body.token, authSecret);

        if (decoded.role != 'admin') {

            let error = {
                erro: true,
                tipo: 'ERRO',
                msg: 'Não autorizado',
            }

            return res.status(400).send(error)

        }

        console.log(decoded)


    } catch (error) {

        console.log(error)

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.status(400).send(err)
    }



    try {

        const email = decoded.email;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);


        const usuario = await Users.findOne({ email: email });

        if (!usuario) {
            return res.status(404).send("Usuário não encontrado.");
        }

        usuario.name = req.body.name || usuario.name;
        usuario.email = req.body.email || usuario.email;
        usuario.password = hashedPassword || usuario.password;

        console.log(usuario)

        await usuario.save();


        return res.status(200).send({ sucesso: true, mensagem: 'Usuário atualizado com sucesso.' });

    } catch (error) {

        return res.status(500).send({ sucesso: false, mensagem: 'Ocorreu um erro ao atualizar o usuário.' });
    }



}

const deleteUser = async (req, res, next) => {

    console.log(req.body)

    let decoded = {}

    try {

        decoded = jwt.decode(req.body.token, authSecret);

        if (decoded.role != 'admin') {

            let error = {
                erro: true,
                tipo: 'ERRO',
                msg: 'Não autorizado',
            }

            return res.status(400).send(error)

        }

        console.log(decoded)


    } catch (error) {

        console.log(error)

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.status(400).send(err)
    }

    try {
        const userId = req.body.userId;

        const deletedUser = await Users.findOneAndDelete({ _id: userId });

        if (!deletedUser) {
            return res.status(404).send("Usuário não encontrado.");
        }

        console.log(deleteUser)

        return res.send(`Usuário com o email  foi excluído com sucesso.`);
    } catch (error) {
        return res.status(500).send("Erro ao excluir o usuário: " + error.message);
    }

}

const getUsers = async (req, res, next) => {

    console.log(req.body)

    let decoded = {}

    try {

        decoded = jwt.decode(req.body.token, authSecret);

        if (decoded.role != 'admin') {

            let error = {
                erro: true,
                tipo: 'ERRO',
                msg: 'Não autorizado',
            }

            return res.status(400).send(error)

        }

        console.log(decoded)


    } catch (error) {

        console.log(error)

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.status(400).send(err)
    }

    const users = await Users.find({role: { $ne: 'admin' } })
    return res.send(users)
}

const signin = async (req, res) => {

    console.log(req.body)

    if (!req.body.email || !req.body.password) {
        return res.status(400).send("Informe o usuário e password!")
    }


    var usuario = await Users.findOne({ email: req.body.email }).lean().then((user) => {

        return user
    })

    console.log(usuario)

    if (!usuario) {
        return res.status(400).send("Usuário inválido")
    }

    console.log(usuario.password)
    console.log(req.body.password)


    const isMatch = bcrypt.compareSync(req.body.password, usuario.password)

    if (!isMatch) return res.status(401).send("Email/password inválidos")

    const now = Math.floor(Date.now() / 1000)
    const payload = {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email,
        iat: now,
        exp: now + (60 * 60 * 24 * 3),
        role: usuario.role,
        tables: usuario.tables
    }



    return res.json({
        ...payload,
        token: await jwt.encode(payload, authSecret)
    })

}


routesUsers.post('/solicitacoes/resolve', avlSolicitacao);
routesUsers.post('/solicicoes', getSolicitacoes);
routesUsers.post("/solicitacao-nova-conta", newSolicitacao);
routesUsers.post('/update', updateUser);
routesUsers.post("/deleteuser", deleteUser);
routesUsers.post("/generateUser", generateUser);
routesUsers.post('/login', signin);
routesUsers.post('/all', getUsers);
//routesUsers.get('/', getUsers);




module.exports = { routesUsers, Users };



/**
 * let constanteTables = [
    { name: 'GOLD RB', value: 46205, cheked: true },
    { name: 'GOLD + RB', value: 46183, cheked: true },
    { name: 'FLEX 2', value: 40789, cheked: true },
    { name: 'FLEX 1', value: 40770, cheked: true },
    { name: 'FLEX -', value: 40762, cheked: true },
    { name: 'SMART', value: 40797, cheked: true },
    { name: 'LIGHT RB', value: 46230, cheked: true },
    { name: 'PLUS', value: 46213, cheked: true },
    { name: 'PLUS +', value: 46191, cheked: true },
]

Users.updateMany({
    $or: [
      { tables: { $size: 0 } }, 
      { tables: { $exists: false } }, 
    ]
  }, { $set: { tables: [...constanteTables] } })
    .then(result => {
      console.log('Documentos com tables vazias ou ausentes atualizados com sucesso.');
    })
    .catch(err => {
      console.error('Erro ao atualizar os documentos:', err);
    });

 */
