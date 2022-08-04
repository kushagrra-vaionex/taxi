const functions = require('firebase-functions')

const stripe = require('stripe')('pk_test_51LSiA7SG23wo0LMeLU8K06dSaaZrwyJtSm9EYFcDcUgVYpq24wTbdSDSk55j9Y8RFEEqAQVAbcczlWFsxhD42rvC002du2W0aA');

stripe.customers.create({
  email: 'manoj@vaionex.com',
})
    .then(customer => console.log(customer.id))
    .catch(error => console.error(error));

exports.makeStripePayment = functions.https.onCall(async (data, context) => {
  const { amount, currency } = data
  console.log(amount, currency)
  return new Promise(function (resolve, reject) {
    stripe.paymentIntents.create(
      {
        amount: amount,
        currency: currency,
      },
      (err, paymentIntent) => {
        if (err) {
          console.log(err)
          resolve({ success: false })
        }
        const result = {
          clientSecret: paymentIntent.client_secret,
          success: true,
        }
        console.log(result)
        resolve(result)
      },
    )
  })
})
