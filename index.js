const axios = require('axios');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var xml2js  = require('xml2js');
var app     = express();

app.get('/parati/scrapping', function(req, res){
  url = 'http://api.paratifinanceira.com/prod/simulate?amount=1000&number_installments=21&rate_month=1.1&rate_year=&accepted_at=2017-11-16&first_due=2018-02-16&type=PJ&discounts=%7B%22iof%22%3A%7B%22PV%22%3A%22false%22%7D%2C%22comissao%22%3A%7B%22percent%22%3A%226%22%2C%22PV%22%3A%22false%22%7D%7D&form=1';

  request(url, function(error, response, html){
    if(!error){

      var $ = cheerio.load(html);

      var input = $('#installments');
      var inputValue = JSON.parse(input.val())[0];
      var installmentAmount = inputValue.amount;

      console.log(inputValue);

      res.send('Look your console');
    }
  })
});

app.get('/api/correios', async (req, res) => {
  const getShippingData = async () => {
    const url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';

    const response = await axios.get(url, {
      params: {
        'nCdEmpresa': '',
        'sDsSenha': '',
        'sCepOrigem': '74380150',
        'sCepDestino': '43810040',
        'nVlPeso': '5',
        'nCdFormato': '1',
        'nVlComprimento': '16',
        'nVlAltura': '5',
        'nVlLargura': '15',
        'nVlDiametro': '0',
        'sCdMaoPropria': 's',
        'nVlValorDeclarado': '200',
        'sCdAvisoRecebimento': 'n',
        'StrRetorno': 'xml',
        'nCdServico': '40010,41106'
      }
    });
    return response;
  };
  const handlingShippingData = (response) => {
    var shippingResponse = [];
    var parser = new xml2js.Parser({ 'async': true, 'attrkey': '@', 'explicitArray': false });
    parser.parseString(response.data, (err, xml) => {
      if (err) return console.log('Erro ', err);

      for (let i = 0; i < xml.Servicos.cServico.length; i++) {
        var row = xml.Servicos.cServico[i];
        shippingResponse.push(row);
      };
      return res.send({ shippingData: shippingResponse });
    });
  };

  const response = await getShippingData();
  const shipping = await handlingShippingData(response);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);