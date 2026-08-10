import React, { useState } from 'react'
import { FiDownload, FiZoomIn, FiZoomOut, FiCopy, FiCheck } from 'react-icons/fi'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'

export const QRCodeDisplay = ({ qrCode, size = 200, value, onDownload }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const isDataImage = qrCode?.startsWith('data:image')
  const isHttpImage =
    qrCode?.startsWith('http') &&
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(qrCode)
  const isKhqrPayload = typeof value === 'string' && value.startsWith('000201')
  const isImageUrl = (isDataImage || isHttpImage) && !isKhqrPayload
  const qrValue = value || (!isImageUrl && qrCode?.startsWith('000201') ? qrCode : null) || (!isImageUrl && qrCode ? qrCode : null)

  const handleDownload = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (isImageUrl && qrCode) {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        const link = document.createElement('a')
        link.download = 'khqr-code.png'
        link.href = canvas.toDataURL()
        link.click()
      }
      img.src = qrCode
    } else if (qrValue) {
      // For raw QR code value, we'd need to generate the QR first
      // This is a placeholder - in production, you'd use a library to generate the QR as image
      toast.info('Download feature requires QR image URL')
    }
    
    if (onDownload) onDownload()
  }

  const handleCopyQRValue = () => {
    if (qrValue) {
      navigator.clipboard.writeText(qrValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* QR Code Container */}
      <div 
        className={`relative bg-white p-4 rounded-xl shadow-lg transition-all duration-300 ${
          isZoomed ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90' : ''
        }`}
        style={isZoomed ? { background: 'rgba(0,0,0,0.9)' } : {}}
      >
        <div className="relative">
          {isImageUrl && qrCode ? (
            <img 
              src={qrCode} 
              alt="KHQR Code" 
              className={`${isZoomed ? 'max-h-[90vh] max-w-[90vw]' : ''}`}
              style={{ width: isZoomed ? 'auto' : size, height: isZoomed ? 'auto' : size }}
            />
          ) : qrValue ? (
            <div style={{ width: isZoomed ? 400 : size, height: isZoomed ? 400 : size }}>
              <QRCode
                value={qrValue}
                size={isZoomed ? 400 : size}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          ) : (
            <div 
              className="bg-gray-200 rounded-lg flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <span className="text-gray-400">QR Code</span>
            </div>
          )}
          
          {/* Zoom Button */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition"
          >
            {isZoomed ? <FiZoomOut size={16} /> : <FiZoomIn size={16} />}
          </button>
        </div>

        {/* Actions for zoomed view */}
        {isZoomed && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              onClick={() => setIsZoomed(false)}
              className="px-4 py-2 bg-white rounded-lg shadow-md"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md"
            >
              Download
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <FiDownload size={14} />
          Download
        </button>
        
        {qrValue && (
          <button
            onClick={handleCopyQRValue}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        )}
      </div>

      {/* QR Code Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>Scan with your banking app</p>
        {qrValue && (
          <p className="font-mono text-xs mt-1 break-all max-w-xs">
            {qrValue.length > 50 ? `${qrValue.substring(0, 50)}...` : qrValue}
          </p>
        )}
      </div>
    </div>
  )
}

export default QRCodeDisplay