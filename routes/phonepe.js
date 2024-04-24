const express=require('express');
const router=express.Router();
const sha256=require('sha256');
const axios=require('axios');
const crypto=require('crypto');

function getTransactionID() {
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 1000000000); 
    const merchantPrefix = 'T'
    const transactionID = `${merchantPrefix}${timestamp}${randomNumber}`;
    return transactionID;
}
const responseData={}

router.post('/payment', async (req, res) => {
    const { amount, name, phone } = req.body;
    const transactionID = getTransactionID();
    const paymentMode = 'CREDIT';
    const currency = 'INR';
    const merchantID = 'PGTESTPAYUAT';
    // const merchantKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const redirectUrl = 'http://localhost:3000/payment/validate';
    const callbackUrl = 'https://webhook.site/callback-url';
    const saltIndex = 1;
    const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    // const mobileNumber = '9999999999';
    const paymentInstrument = {
        type: 'PAY_PAGE',
    };
    const payload = {
        merchantId: merchantID,
        transactionId: transactionID,
        merchantUserID: 'MUID23HH345I34',
        amount: amount*100,
        currency: currency,
        paymentMode: paymentMode,
        paymentInstrument: paymentInstrument,
        redirectUrl: redirectUrl,
        redirectMode: 'POST',
        // callbackUrl: callbackUrl,
        paymentInstrument: {
            "type": "UPI_INTENT",
            "targetApp": "com.phonepe.app"
          },
        name: name,
        mobileNumber: phone,
        saltKey: saltKey,
    };
    // const bufferObj = Buffer.from(JSON.stringify(payload), 'utf8');
    // const base64EncodedPayload = bufferObj.toString('base64');
    // const string = base64EncodedPayload + '/pg/v1/pay' + saltKey;
    // const sha256_val = sha256(string);
    // const xVerifyChecksum = sha256_val + '###' + saltIndex;
    const payloadData=JSON.stringify(payload);
    const payloadBuffer=Buffer.from(payloadData).toString('base64');
    const string=payloadBuffer+'/pg/v1/pay'+saltKey;
    const sha256_val=sha256(string);
    const xVerifyChecksum=sha256_val+'###'+saltIndex;
    const base64EncodedPayload=Buffer.from(payloadData).toString('base64');
    const URL='https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
    const options = {
        method: 'POST',
        url: URL,
        headers: {
            accept: 'text/plain',
            'Content-Type': 'application/json',
        },
        data: {
            request: base64EncodedPayload,
            verifyChecksum: xVerifyChecksum,
        },
        
    }

    axios.request(options)
        .then((response) => {
           return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url);
        //    responseData=response.data.data.instrumentResponse.redirectInfo.url;
        })
        .catch((error) => {
            console.error(error);
            res.json(error);
        });

        // res.send(responseData);
    // await axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
    //     request: base64EncodedPayload,
    //     verifyChecksum: xVerifyChecksum,
    // }, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // })
    //     .then((response) => {
    //         res.send(response.data);
    //     })
    //     .catch((error) => {
    //         res.send(error);
    //     });
    }
);

//payment verification
router.post('/payment/validate', async (req, res) => {
    const { merchantTransactionId, MERCHANT_ID } = req.params;
    const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const KEY_INDEX=1;
    const SALT_KEY='099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'; 
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}}`+ SALT_KEY;
    // const sha=crypto.createCipheriv('sha256').update(string).digest('hex');
    // const checkSum=sha+ '###' + KEY_INDEX;
    const sha256_val = sha256(string);
    const xVerifyChecksum = sha256_val + "###" + SALT_INDEX;
    const options = {
        method: 'GET',
        url: URL,
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerifyChecksum,
            'X-MERCHANT-ID': merchantTransactionId,
        },
    }
    await axios.request(options)
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            res.send(error);
        });
});


module.exports=router;