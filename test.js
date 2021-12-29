var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'myfabdvfl@gmail.com',
    pass: 'J4imeNiLeCafeNiLeTheMaisLa212VaVenirMeChercherTyCody'
  }
});

var mailOptions = {
  from: 'myfabdvfl@gmail.com',
  to: '	mathieuman78@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});