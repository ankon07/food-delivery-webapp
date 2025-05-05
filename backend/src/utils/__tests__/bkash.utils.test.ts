import { getBkashToken, createBkashPayment, executeBkashPayment, queryBkashPayment } from '../bkash.utils';

describe('bKash Utilities', () => {
  describe('getBkashToken', () => {
    it('should return a token response', async () => {
      const response = await getBkashToken();
      
      expect(response).toHaveProperty('id_token');
      expect(response).toHaveProperty('token_type');
      expect(response).toHaveProperty('expires_in');
      expect(response).toHaveProperty('refresh_token');
    });
  });
  
  describe('createBkashPayment', () => {
    it('should create a payment and return payment details', async () => {
      const amount = 100;
      const merchantInvoiceNumber = 'INV-123';
      
      const response = await createBkashPayment(amount, merchantInvoiceNumber);
      
      expect(response).toHaveProperty('paymentID');
      expect(response).toHaveProperty('createTime');
      expect(response).toHaveProperty('orgLogo');
      expect(response).toHaveProperty('orgName');
      expect(response).toHaveProperty('transactionStatus');
      expect(response).toHaveProperty('amount');
      expect(response).toHaveProperty('currency');
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('merchantInvoiceNumber');
      expect(response).toHaveProperty('bkashURL');
      
      // Check if amount is correctly set
      expect(response.amount).toBe(amount.toString());
      
      // Check if merchantInvoiceNumber is correctly set
      expect(response.merchantInvoiceNumber).toBe(merchantInvoiceNumber);
    });
  });
  
  describe('executeBkashPayment', () => {
    it('should execute a payment and return execution details', async () => {
      const paymentID = 'mock_payment_id';
      
      const response = await executeBkashPayment(paymentID);
      
      expect(response).toHaveProperty('paymentID');
      expect(response).toHaveProperty('createTime');
      expect(response).toHaveProperty('updateTime');
      expect(response).toHaveProperty('trxID');
      expect(response).toHaveProperty('transactionStatus');
      expect(response).toHaveProperty('amount');
      expect(response).toHaveProperty('currency');
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('merchantInvoiceNumber');
      
      // Check if paymentID is correctly set
      expect(response.paymentID).toBe(paymentID);
      
      // Check if transaction status is completed
      expect(response.transactionStatus).toBe('Completed');
    });
  });
  
  describe('queryBkashPayment', () => {
    it('should query a payment and return payment details', async () => {
      const paymentID = 'mock_payment_id';
      
      const response = await queryBkashPayment(paymentID);
      
      expect(response).toHaveProperty('paymentID');
      expect(response).toHaveProperty('createTime');
      expect(response).toHaveProperty('updateTime');
      expect(response).toHaveProperty('trxID');
      expect(response).toHaveProperty('transactionStatus');
      expect(response).toHaveProperty('amount');
      expect(response).toHaveProperty('currency');
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('merchantInvoiceNumber');
      
      // Check if paymentID is correctly set
      expect(response.paymentID).toBe(paymentID);
    });
  });
});
