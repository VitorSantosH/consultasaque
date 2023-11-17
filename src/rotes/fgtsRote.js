const express = require('express');
const routesFgts = require('express').Router();
const config = require('../config/.config.js')
const axios = require('axios');
const { authSecret } = require("../config/secret.js");
const jwt = require('jwt-simple');
const rateLimit = require('express-rate-limit');
const { Users } = require("./newUser");
const conn = require('../config/mongoConfig.js');
const pesquisaSchema = require('../models/pesquisaSchema');
const pesquisaCpf = conn.model('pesquisaCpf', pesquisaSchema);


//facta 

// middleware para renovação do token
routesFgts.use(async (req, res, next) => {

    console.log('aqui')

    console.log('Checando token....')

    // Configurações da requisição
    const AxiosConfig = {
        headers: {
            'Authorization': config.basicAuthString
        }
    };
    const now = new Date();


    if (!config.token || config.expiration <= now) {

        console.log("Token expirado, gerando novo token....")

        // Realizar a requisição GET com o header
        const response = await axios.get(config.urlGetToken, AxiosConfig)
            .then(response => {

                console.log("Novo token gerado com sucesso")
                console.log(response.data); // Dados da resposta do sistema externo


                const expiration = new Date(now.getTime() + 3600 * 1000);


                config.token = `Bearer ${response.data.token}`
                config.expiration = expiration
                return next();

            })
            .catch(error => {



                console.error('Erro na requisição:', error);

                return res.send(error)
            });



    } else {
        console.log('token valido até ' + config.expiration)
        return next();
    }



})

routesFgts.post('/getTable', async (req, res) => {


    console.log('getTable')


    const dataTabelas = []

    console.log(req.body.params)

    let usuario
    let payload
    const now = Math.floor(Date.now() / 1000)

    try {

        usuario = await Users.findOne({ _id: req.body.params.user.id })

        usuario.tables = req.body.params.table

        console.log(usuario)

        await usuario.save();

        payload = {
            id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            iat: now,
            exp: now + (60 * 60 * 24 * 3),
            role: usuario.role,
            tables: usuario.tables
        }

    } catch (error) {
        console.log(error)
    }


    const headers = {
        'Authorization': config.token,
        'Content-Type': 'application/json'
    };

    for (let index = 0; index < req.body.params.table.length; index++) {

        const tables = [
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

        const requestData = JSON.stringify({
            cpf: req.body.params.cpf,
            tabela: req.body.params.table[index].value,
            parcelas: req.body.params.parcelas
        });

        await axios.post(config.urlGetTable, requestData, { headers: headers })
            .then(response => {

                const defineTable = tables.find((item) => item.value === req.body.params.table[index].value)
                response.data.tabela = defineTable.name

                console.log(response.data)

                return dataTabelas.push(response.data)
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                return dataTabelas.push(error)
            });

    }

    // salva os dados da pesquisa usando o id de quem pesquisou como "autor"
    let resultPesquisa

    try {

        const pesquisa = new pesquisaCpf({
            autor: usuario._id,
            autorEmail: usuario.email,
            cpf: req.body.params.cpf,
            data: dataTabelas,
        })

        pesquisa.save()
            .then((result) => {
                resultPesquisa = result
                console.log('Pesquisa salva com sucesso:', result);
            })
            .catch((err) => {
                resultPesquisa = err
                console.error('Erro ao salvar a pesquisa:', err);
            });

    } catch (error) {
        resultPesquisa = error
        console.log(err)
    }


    return res.send({ dataTabelas, payload, resultPesquisa })

})

routesFgts.post('/saldo', async (req, res) => {

    console.log('mid 2')

    const user = JSON.parse(req.body.id)
    try {

        const decoded = jwt.decode(user.token, authSecret)

    } catch (error) {

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.send(err)
    }

    const params = {
        cpf: req.body.cpf
    };
    const headers = {
        'Authorization': config.token,
    };
    const configParans = {
        params,
        headers
    };

    axios.get(config.urlGetSaldo, configParans)
        .then(response => {
            console.log(response.data);
            return res.send(response.data)
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            return res.send(error)
        });




})

routesFgts.post("/history", async (req, res) => {


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



        await pesquisaCpf.find({ autor: req.body.userId })
            .then(result => {
                console.log(result)
                return res.send(result);
            })
            .catch(err => {
                console.log(err)
                return res.send(err);
            })



    } catch (error) {

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }
        return res.status(400).send(err)
    }


})



// excluir historico antigo 

var interval = 24 * 60 * 60 * 1000

async function adicionarExpiracao() {

    console.log("Adicionando expiração...")

    const dataLimite = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 dias atrás

    const update = {
        $set: {
            expiracao: dataLimite
        }
    }

    try {

        const pesquisa = await pesquisaCpf.find({});
        console.log(pesquisa)
        
        const retornoAddExp = await pesquisaCpf.updateMany({ expiracao: { $exists: false } }, update)
            .then(res => {
                console.log('Campo adicionado com sucesso.');
                return res
            })
            .catch(err => {
                console.log("Erro: >>>>> ")
                return err
            })

        console.log(retornoAddExp)


    } catch (error) {
        console.error('Erro ao excluir documentos antigos:', error);
    }


    console.log("Excluindo documentos antigos...")

    try {
        const retorno = await pesquisaCpf.deleteMany({ expiracao: { $lt: dataLimite } })
            .then(res => {
                return res
            })
            .catch(err => {
                return err
            })

        console.log(retorno)

    } catch (error) {
        console.log("Erro ao excluir" + error)
    }

    

}

// Chamar a função a cada 24 horas (ajuste conforme necessário)
setInterval(adicionarExpiracao, interval);




// pan 

// rate limit  pan
const limiter = rateLimit({
    windowMs: 60000,
    max: 2,
    message: 'Você atingiu o limite de solicitações por minuto.',
})


routesFgts.use('/pan', limiter);

routesFgts.use('/pan', async (req, res, next) => {


    const expiration = config.pan.expiration;
    const atualDate = Date.now();

    if (expiration > atualDate) {
        // O token ainda é válido
        console.log('Token válido: ' + expiration)
        return next()
    }

    console.log('Token inválido: gerando novo token')

    const headers = {
        'Authorization': `${config.pan.basicAuthStringPan}`,
        'Content-Type': 'application/json',
        'ApiKey': config.pan.apiKey

    };

    const requestData = JSON.stringify({

        "username": "41844011801_008016",
        "password": "Ame!@#03",
        "grant_type": "client_credentials+password"

    });



    await axios.post('https://api.bancopan.com.br/consignado/v0/tokens', requestData, { headers: headers })
        .then(response => {

            console.log('Token gerado com sucesso.')
            console.log(response.data)
            const expiration = new Date(response.data.expires_in);

            config.pan.token = `Bearer ${response.data.token}`;
            config.pan.expiration = expiration;

            return next()

        })
        .catch(error => {

            console.error(error.response);
            return res.send('error')
        });


})

routesFgts.get('/pan/saldo', async (req, res) => {

    const headers = {
        'Authorization': `${config.pan.token}`,
        'Content-Type': 'application/json',
        'ApiKey': config.pan.apiKey

    };

    const requestData = JSON.stringify({

        "cpf_cliente": "138.478.886-76",
        "codigo_promotora": config.pan.promotora,
        "incluir_seguro": "false",
        "data_nascimento": "24-04-1996",
        //"valor_solicitado": 1000,


    });

    console.log(headers)
    console.log(requestData)

    await axios.post('https://api.bancopan.com.br/openapi/consignado/v2/emprestimos/simulacao/fgts', requestData, { headers: headers })
        .then(response => {

            //  console.log(response)
            console.log(response.data)

            return res.send(response.data)
        })
        .catch(error => {
            console.error(error.response);
            return res.send(error)
        });

})


module.exports = routesFgts;