"use client";

const printStyles = `
  @media print {
    .not-printable {
      display: none !important;
    }
  }
`;

import React from 'react';
import Modal from '@/components/ui/Modal';
import { X, Download } from 'lucide-react';
import NewInvoiceTemplate from '../ui/NewInvoiceTemplate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface OrderItem {
  id: string;
  name: string;
  nickname?: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  // nickname?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  orderDate: string;
  paymentMethod: string;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  console.log('ViewOrderModal:', { isOpen, order });

  const handleDownloadInvoice = async () => {
    console.log('Downloading invoice...');
    const invoiceElement = document.getElementById('printable-content');
    if (!invoiceElement) {
      console.error('Invoice template element not found');
      return;
    }

    let tempContainer = null;
    try {
      // Create a temporary container with fixed dimensions
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // Clone the invoice element into the temporary container
      const invoiceClone = invoiceElement.cloneNode(true) as HTMLElement;
      invoiceClone.style.display = 'block';
      invoiceClone.style.visibility = 'visible';
      invoiceClone.style.width = '100%';
      invoiceClone.style.margin = '0';
      invoiceClone.style.padding = '40px'; // Add padding for better layout
      tempContainer.appendChild(invoiceClone);

      // Remove any fixed positioning and transform styles that might affect rendering
      const elements = invoiceClone.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        if (el.style.position === 'fixed') el.style.position = 'absolute';
        if (el.style.transform) el.style.transform = 'none';
      }

      // Ensure all images are loaded
      const images = invoiceClone.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
        });
      }));

      // Wait for fonts and other resources to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(invoiceClone, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels
        height: invoiceClone.offsetHeight,
        windowWidth: 794,
        onclone: (doc) => {
          // Additional styling for better PDF output
          const content = doc.getElementById('printable-content');
          if (content) {
            content.style.minHeight = '1123px'; // A4 height in pixels
          }
        }
      });

      if (!canvas || !canvas.toDataURL) {
        throw new Error('Failed to create canvas context');
      }

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      if (!imgData || imgData === 'data:,') {
        throw new Error('Canvas is empty or failed to generate image data');
      }

      // Create PDF with A4 dimensions and margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margins
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);

      // Calculate the number of pages needed based on content height
      const pixelContentHeight = invoiceClone.offsetHeight;
      const pixelPageHeight = 1123; // A4 height in pixels at 96 DPI
      const totalPages = Math.ceil(pixelContentHeight / (pixelPageHeight - 40)); // Subtract margins

      // Add each page to the PDF
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        // Calculate the vertical offset for current page
        const yOffset = -i * (pixelPageHeight - 40);

        // Create canvas for current page section
        const pageCanvas = await html2canvas(invoiceClone, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794 - 20, // Subtract horizontal margins
          height: pixelPageHeight - 40, // Subtract vertical margins
          windowWidth: 794 - 20,
          y: i * (pixelPageHeight - 40),
          onclone: (doc) => {
            const content = doc.getElementById('printable-content');
            if (content) {
              content.style.transform = `translateY(${yOffset}px)`;
              // Add extra spacing between sections
              const sections = content.querySelectorAll('.page-break-inside-avoid');
              sections.forEach(section => {
                (section as HTMLElement).style.marginBottom = '20px';
              });
            }
          }
        });

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, contentHeight);
      }

      pdf.save(`invoice-${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      // Ensure cleanup of temporary elements
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  }

  return (
    <>
      <style>{printStyles}</style>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          {/* <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"> */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Order Details</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </button>
              {/* <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button> */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="print:block" id="printable-content">
            <NewInvoiceTemplate order={order} />
          </div>
          {/* </div> */}
        </Modal>
      )}
    </>
  );
}
