import axios from './axios'

export const createKHQRPayment = async ( paymentData ) => {
  const { data } = await axios.post( '/payments/khqr', paymentData )
  return data
}

export const verifyPayment = async ( paymentId, transactionId ) => {
  const { data } = await axios.post( '/payments/verify', { paymentId, transactionId } )
  return data
}

export const getPaymentStatus = async ( id ) => {
  const { data } = await axios.get( `/payments/status/${ id }` )
  return data
}

export const getPaymentHistory = async () => {
  const { data } = await axios.get( '/payments/history' )
  return data
}

export const getPaymentByOrder = async ( orderId ) => {
  const { data } = await axios.get( `/payments/order/${ orderId }` )
  return data
}

// Admin only
export const getAllPayments = async ( params = {} ) => {
  const { data } = await axios.get( '/payments', { params } )
  return data
}

export const refundPayment = async ( paymentId, reason ) => {
  const { data } = await axios.post( `/payments/${ paymentId }/refund`, { reason } )
  return data
}