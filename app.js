var express = require('express');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');

function numWithCommas(x) {
  var parts = parseInt(x, 10).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

var API_BASE = 'https://api.hubapi.com';
var API_KEY = '21f2fd93-ec21-4d38-a7de-96f576f27222';

var app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hi! Welcome to this hook.');
});

app.get('/wakeUp', (req, res) => {
  res.send('Zzz... Okay.');
});

app.post('/postPropertyChangesAsNoteToCompanyPage', ({ body }, res) => {
  if (!('properties' in body)) {
    return res.send('Contact not valid.');
  }
  if (!('associatedcompanyid' in body.properties) || !("value" in body.properties.associatedcompanyid)) {
    return res.send('Company not found.');
  }

  var note = '';
  if ('firstname' in body.properties && 'lastname' in body.properties) {
    note += ('<div><span style=\"font-weight: bold; font-size: 16px;\">' + body.properties.firstname.value + ' ' + body.properties.lastname.value + ' just submitted Quarterly Update</span></div>');
  } else {
    note += '<div><span style=\"font-weight: bold; font-size: 16px;\">Quarterly Update</span></div>';
  }
  if ('raised_fund' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Raised fund:</span> ' + body.properties.raised_fund.value + '</div>');
  }
  if (body.properties.raised_fund.value === 'Yes (Equity Round)') {
    if ('price_per_share_if_raised_equity_round' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Price per Share:</span> $' + numWithCommas(body.properties.price_per_share_if_raised_equity_round.value) + '</div>');
    }
    if ('class_of_shares_if_raised_equity_round' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Class of Shares:</span> ' + body.properties.class_of_shares_if_raised_equity_round.value + '</div>');
    }
    if ('amount_if_raised_equity_round' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Amount:</span> $' + numWithCommas(body.properties.amount_if_raised_equity_round.value) + '</div>');
    }
    if ('pre_money_valuation_if_raised_equity_round' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Pre-money Valuation:</span> $' + numWithCommas(body.properties.pre_money_valuation_if_raised_equity_round.value) + '</div>');
    }
  }
  if (body.properties.raised_fund.value === 'Yes (Convertible Notes)') {
    if ('amount_if_raised_convertible_notes' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Amount:</span> $' + numWithCommas(body.properties.amount_if_raised_convertible_notes.value) + '</div>');
    }
    if ('valuation_cap_if_raised_convertible_notes' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Valuation Cap:</span> $' + numWithCommas(body.properties.valuation_cap_if_raised_convertible_notes.value) + '</div>');
    }
  }
  if (body.properties.raised_fund.value === 'No') {
    if ('valuation_cap_if_no_raise' in body.properties) {
      note += ('<div style=\"margin-left: 8px; margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Valuation Cap:</span> $' + numWithCommas(body.properties.valuation_cap_if_no_raise.value) + '</div>');
    }
  }
  if ('estimated_months_of_runway' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Months of Runway:</span> ' + body.properties.estimated_months_of_runway.value + ' months</div>');
  }
  if ('current_monthly_revenue' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Monthly Revenue:</span> $' + numWithCommas(body.properties.current_monthly_revenue.value) + '</div>');
  }
  if ('current_cash_in_bank' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Cash in Bank:</span> $' + numWithCommas(body.properties.current_cash_in_bank.value) + '</div>');
  }
  if ('latest_capitalization_table' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Cap Table:</span> ' + body.properties.latest_capitalization_table.value + '</div>');
  }
  if ('quarterly_startup_health' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Startup Health 1-to-5 Scale:</span> ' + body.properties.quarterly_startup_health.value + '</div>');
  }
  if ('update_help_me' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Biggest Problem Area:</span> ' + body.properties.update_help_me.value + '</div>');
  }
  if ('other_comments' in body.properties) {
    note += ('<div style=\"margin-top: 6px;\"><span style=\"color: rgb(120, 120, 120);\">Other Comments:</span> ' + body.properties.other_comments.value + '</div>');
  }

  var companyId = parseInt(body.properties.associatedcompanyid.value, 10);
  var body = JSON.stringify({
      engagement: { active: true, type: "NOTE" },
      associations: { companyIds: [companyId] },
      metadata: { body: note }
    });

  fetch(`${API_BASE}/engagements/v1/engagements?hapikey=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(r => { if (r.ok) res.send('Okay') });
});

app.use((err, req, res, next) => {
  res.status(500).send('Error 500. Something broke!');
});

app.use((req, res, next) => {
  res.status(404).send('Error 404. Sorry can\'t find that!');
});

app.listen(process.env.PORT || 3000);
