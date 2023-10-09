const credentials = "93772:7jwxtuhtbzd3ho6iis0t";
const base64Credentials = Buffer.from(credentials).toString('base64');


const credentialsPan = "l7448bea9949d347ad9b988ae1e0de18f1:f405e5d28ca84c49ab29f5338bf4addd";
const base64CredentialsPan = Buffer.from(credentialsPan).toString('base64')

config = {
    basicAuthString: `Basic ${base64Credentials}`,
    token: undefined,
    expiration: undefined,
    urlGetToken: 'https://webservice.facta.com.br/gera-token',
    urlGetSaldo: "https://webservice.facta.com.br/fgts/saldo",
    urlGetTable: "https://webservice.facta.com.br/fgts/calculo",
    pan: {
        token: undefined,
        apiKey: 'l7448bea9949d347ad9b988ae1e0de18f1',
        apiSecret: 'f405e5d28ca84c49ab29f5338bf4addd',
        userName: "49304021820_00801",
        password: 'Ame!@#10',
        basicAuthStringPan: `Basic ${base64CredentialsPan}`,
        expiration: undefined,
        promotora: '008016'
    }
}

/**
 * // url facta
const url = 'https://webservice-homol.facta.com.br/gera-token';
 */


module.exports = config